import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { updateAppointmentSchema } from "@/lib/validations/appointment";
import { sendNotification } from "@/lib/notifications";
import { addMinutes } from "date-fns";
import { fromZonedTime } from "date-fns-tz";
import { AppointmentStatus } from "@prisma/client";

const TIMEZONE = process.env.TZ || "America/Sao_Paulo";

async function requireAdmin() {
  const session = await getSession();
  return session.adminId ? session : null;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: { service: true },
  });

  if (!appointment) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  return NextResponse.json(appointment);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const body = await req.json();
  const parsed = updateAppointmentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const current = await prisma.appointment.findUnique({
    where: { id },
    include: { service: true },
  });
  if (!current) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  const { status, date, time, serviceId, notes } = parsed.data;
  const updateData: Record<string, unknown> = {};

  if (status) updateData.status = status;
  if (notes !== undefined) updateData.notes = notes;

  // Handle reschedule
  if (date || time || serviceId) {
    const newDate = date || current.startTime.toISOString().slice(0, 10);
    const svc = serviceId
      ? await prisma.service.findUnique({ where: { id: serviceId } })
      : current.service;
    if (!svc) return NextResponse.json({ error: "Serviço não encontrado" }, { status: 404 });

    const [h, m] = (time || "00:00").split(":").map(Number);
    const [y, mo, d] = newDate.split("-").map(Number);
    const startTime = fromZonedTime(new Date(y, mo - 1, d, h, m, 0), TIMEZONE);
    const endTime = addMinutes(startTime, svc.durationMins);

    updateData.startTime = startTime;
    updateData.endTime = endTime;
    if (serviceId) updateData.serviceId = serviceId;
  }

  const updated = await prisma.appointment.update({
    where: { id },
    data: updateData,
    include: { service: true },
  });

  // Send notification based on what changed
  if (status === "CANCELLED") {
    sendNotification(updated as any, "CANCELLATION").catch(console.error);
  } else if (status === "CONFIRMED") {
    sendNotification(updated as any, "CONFIRMATION").catch(console.error);
  } else if (date || time) {
    sendNotification(updated as any, "MODIFICATION").catch(console.error);
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: { service: true },
  });
  if (!appointment) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  const updated = await prisma.appointment.update({
    where: { id },
    data: { status: "CANCELLED" as AppointmentStatus },
    include: { service: true },
  });

  sendNotification(updated as any, "CANCELLATION").catch(console.error);

  return NextResponse.json({ ok: true });
}
