import { prisma } from "@/lib/prisma";
import { STATUS_LABELS, STATUS_COLORS } from "@/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toZonedTime } from "date-fns-tz";
import Link from "next/link";

const TIMEZONE = process.env.TZ || "America/Sao_Paulo";

export default async function AdminDashboard() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [total, todayCount, pendingCount, todayAppointments] = await Promise.all([
    prisma.appointment.count({ where: { status: { notIn: ["CANCELLED"] } } }),
    prisma.appointment.count({
      where: { startTime: { gte: today, lt: tomorrow }, status: { notIn: ["CANCELLED"] } },
    }),
    prisma.appointment.count({ where: { status: "PENDING" } }),
    prisma.appointment.findMany({
      where: { startTime: { gte: today, lt: tomorrow } },
      include: { service: true },
      orderBy: { startTime: "asc" },
      take: 10,
    }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Agendamentos Hoje" value={todayCount} color="blue" />
        <StatCard label="Pendentes" value={pendingCount} color="yellow" />
        <StatCard label="Total Ativos" value={total} color="green" />
      </div>

      {/* Today's appointments */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Agendamentos de Hoje</h2>
          <Link href="/admin/appointments" className="text-sm text-gray-500 hover:text-gray-900">
            Ver todos →
          </Link>
        </div>
        {todayAppointments.length === 0 ? (
          <div className="p-8 text-center text-gray-400">Nenhum agendamento hoje</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {todayAppointments.map((appt) => {
              const zonedTime = toZonedTime(appt.startTime, TIMEZONE);
              return (
                <Link
                  key={appt.id}
                  href={`/admin/appointments/${appt.id}`}
                  className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-14 text-center">
                    <span className="font-semibold text-gray-900 text-sm">
                      {format(zonedTime, "HH:mm")}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{appt.clientName}</p>
                    <p className="text-sm text-gray-500">{appt.service.name}</p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[appt.status]}`}>
                    {STATUS_LABELS[appt.status]}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    blue: "bg-blue-50 text-blue-700",
    yellow: "bg-yellow-50 text-yellow-700",
    green: "bg-green-50 text-green-700",
  };
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <p className="text-sm text-gray-500 mb-2">{label}</p>
      <p className={`text-3xl font-bold ${colors[color]}`}>{value}</p>
    </div>
  );
}
