import { prisma } from "@/lib/prisma";
import { parseISO, format, addMinutes, isBefore, isAfter } from "date-fns";
import { toZonedTime, fromZonedTime } from "date-fns-tz";

const TIMEZONE = process.env.TZ || "America/Sao_Paulo";

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export async function getAvailableSlots(
  dateStr: string,
  serviceId: string
): Promise<string[]> {
  const localDate = parseISO(dateStr);
  const dayOfWeek = localDate.getDay();

  const [workingHours, blockedDate, service] = await Promise.all([
    prisma.workingHours.findFirst({ where: { dayOfWeek } }),
    prisma.blockedDate.findFirst({
      where: {
        date: {
          gte: fromZonedTime(
            new Date(
              localDate.getFullYear(),
              localDate.getMonth(),
              localDate.getDate(),
              0,
              0,
              0
            ),
            TIMEZONE
          ),
          lt: fromZonedTime(
            new Date(
              localDate.getFullYear(),
              localDate.getMonth(),
              localDate.getDate() + 1,
              0,
              0,
              0
            ),
            TIMEZONE
          ),
        },
      },
    }),
    prisma.service.findUnique({ where: { id: serviceId } }),
  ]);

  if (!workingHours || !workingHours.isOpen || blockedDate || !service) {
    return [];
  }

  const openMinutes = timeToMinutes(workingHours.openTime);
  const closeMinutes = timeToMinutes(workingHours.closeTime);
  const gap = workingHours.slotGapMins;
  const duration = service.durationMins;

  // Generate all candidate slots
  const candidateSlots: { start: Date; end: Date; timeStr: string }[] = [];
  for (
    let min = openMinutes;
    min + duration <= closeMinutes;
    min += gap
  ) {
    const hours = Math.floor(min / 60);
    const minutes = min % 60;
    const timeStr = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;

    const slotStart = fromZonedTime(
      new Date(
        localDate.getFullYear(),
        localDate.getMonth(),
        localDate.getDate(),
        hours,
        minutes,
        0
      ),
      TIMEZONE
    );
    const slotEnd = addMinutes(slotStart, duration);
    candidateSlots.push({ start: slotStart, end: slotEnd, timeStr });
  }

  if (candidateSlots.length === 0) return [];

  // Fetch all overlapping appointments in one query
  const minStart = candidateSlots[0].start;
  const maxEnd = candidateSlots[candidateSlots.length - 1].end;

  const existingAppointments = await prisma.appointment.findMany({
    where: {
      status: { notIn: ["CANCELLED"] },
      startTime: { lt: maxEnd },
      endTime: { gt: minStart },
    },
    select: { startTime: true, endTime: true },
  });

  const now = new Date();

  return candidateSlots
    .filter(({ start, end }) => {
      // No past slots
      if (isBefore(start, now)) return false;
      // No overlapping appointments
      return !existingAppointments.some(
        (appt) =>
          isAfter(end, appt.startTime) && isBefore(start, appt.endTime)
      );
    })
    .map(({ timeStr }) => timeStr);
}
