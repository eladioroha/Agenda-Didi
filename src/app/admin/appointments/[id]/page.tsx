import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { STATUS_LABELS, STATUS_COLORS } from "@/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toZonedTime } from "date-fns-tz";
import { AppointmentActions } from "@/components/admin/AppointmentActions";
import Link from "next/link";

const TIMEZONE = process.env.TZ || "America/Sao_Paulo";

export default async function AppointmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: { service: true },
  });

  if (!appointment) notFound();

  const zonedStart = toZonedTime(appointment.startTime, TIMEZONE);
  const zonedEnd = toZonedTime(appointment.endTime, TIMEZONE);
  const formattedDate = format(zonedStart, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR });

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/appointments" className="text-gray-400 hover:text-gray-900">
          ← Voltar
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-lg font-semibold text-gray-900">Detalhes do Agendamento</h1>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs text-gray-400 mb-1">ID: {appointment.id}</p>
            <span className={`text-sm font-medium px-3 py-1.5 rounded-full ${STATUS_COLORS[appointment.status]}`}>
              {STATUS_LABELS[appointment.status]}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <Section title="Horário">
            <Row label="Data" value={<span className="capitalize">{formattedDate}</span>} />
            <Row label="Início" value={format(zonedStart, "HH:mm")} />
            <Row label="Fim" value={format(zonedEnd, "HH:mm")} />
          </Section>

          <Section title="Serviço">
            <Row label="Nome" value={appointment.service.name} />
            <Row label="Duração" value={`${appointment.service.durationMins} minutos`} />
            <Row label="Valor" value={appointment.service.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} />
          </Section>

          <Section title="Cliente">
            <Row label="Nome" value={appointment.clientName} />
            <Row label="Telefone" value={appointment.clientPhone} />
            {appointment.clientEmail && <Row label="Email" value={appointment.clientEmail} />}
            {appointment.notes && <Row label="Obs." value={appointment.notes} />}
          </Section>
        </div>
      </div>

      <AppointmentActions appointment={appointment as any} />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <span className="text-sm text-gray-500 w-20 flex-shrink-0">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value}</span>
    </div>
  );
}
