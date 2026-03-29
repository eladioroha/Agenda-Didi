import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createAppointmentSchema } from "@/lib/validations/appointment";
import { getAvailableSlots } from "@/lib/availability";
import { sendNotification } from "@/lib/notifications";
import { addMinutes } from "date-fns";
import { fromZonedTime } from "date-fns-tz";

const TIMEZONE = process.env.TZ || "America/Sao_Paulo";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session.adminId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const date = searchParams.get("date");
  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 25);

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (date) {
    const d = new Date(date);
    const nextDay = new Date(d);
    nextDay.setDate(nextDay.getDate() + 1);
    where.startTime = { gte: d, lt: nextDay };
  }

  const [appointments, total] = await Promise.all([
    prisma.appointment.findMany({
      where,
      include: { service: true },
      orderBy: { startTime: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.appointment.count({ where }),
  ]);

  return NextResponse.json({ appointments, total, page, limit });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createAppointmentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { serviceId, date, time, clientName, clientPhone, clientEmail, notes } =
      parsed.data;

    // Re-check availability to prevent race conditions
    const available = await getAvailableSlots(date, serviceId);
    if (!available.includes(time)) {
      return NextResponse.json(
        { error: "Horário não disponível. Por favor, escolha outro." },
        { status: 409 }
      );
    }

    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) {
      return NextResponse.json({ error: "Serviço não encontrado" }, { status: 404 });
    }

    const [h, m] = time.split(":").map(Number);
    const [y, mo, d] = date.split("-").map(Number);
    const startTime = fromZonedTime(new Date(y, mo - 1, d, h, m, 0), TIMEZONE);
    const endTime = addMinutes(startTime, service.durationMins);

    const appointment = await prisma.appointment.create({
      data: {
        clientName,
        clientPhone,
        clientEmail: clientEmail || null,
        serviceId,
        startTime,
        endTime,
        notes: notes || null,
        status: "PENDING",
      },
      include: { service: true },
    });

    // Fire and forget notification
    sendNotification(appointment as any, "CONFIRMATION").catch(console.error);

    return NextResponse.json(appointment, { status: 201 });
  } catch (err) {
    console.error("[Appointments/POST]", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
