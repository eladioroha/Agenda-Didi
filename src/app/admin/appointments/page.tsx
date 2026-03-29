import { prisma } from "@/lib/prisma";
import { STATUS_LABELS, STATUS_COLORS } from "@/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toZonedTime } from "date-fns-tz";
import Link from "next/link";
import { AppointmentFilters } from "@/components/admin/AppointmentFilters";

const TIMEZONE = process.env.TZ || "America/Sao_Paulo";

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; date?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page || 1);
  const limit = 25;

  const where: Record<string, unknown> = {};
  if (params.status) where.status = params.status;
  if (params.date) {
    const d = new Date(params.date);
    const nextDay = new Date(d);
    nextDay.setDate(nextDay.getDate() + 1);
    where.startTime = { gte: d, lt: nextDay };
  }

  const [appointments, total] = await Promise.all([
    prisma.appointment.findMany({
      where,
      include: { service: true },
      orderBy: { startTime: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.appointment.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Agendamentos</h1>
        <span className="text-sm text-gray-500">{total} no total</span>
      </div>

      <AppointmentFilters />

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mt-4">
        {appointments.length === 0 ? (
          <div className="p-12 text-center text-gray-400">Nenhum agendamento encontrado</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Horário</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Cliente</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Serviço</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Contato</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {appointments.map((appt) => {
                  const zonedTime = toZonedTime(appt.startTime, TIMEZONE);
                  return (
                    <tr key={appt.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <p className="font-medium text-gray-900">
                          {format(zonedTime, "HH:mm")}
                        </p>
                        <p className="text-xs text-gray-400">
                          {format(zonedTime, "dd/MM/yyyy")}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{appt.clientName}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{appt.service.name}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[appt.status]}`}>
                          {STATUS_LABELS[appt.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        <p>{appt.clientPhone}</p>
                        {appt.clientEmail && <p>{appt.clientEmail}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/appointments/${appt.id}`}
                          className="text-gray-400 hover:text-gray-900 transition-colors"
                        >
                          →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/appointments?page=${p}${params.status ? `&status=${params.status}` : ""}${params.date ? `&date=${params.date}` : ""}`}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                p === page ? "bg-gray-900 text-white" : "hover:bg-gray-100 text-gray-600"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
