import { prisma } from "@/lib/prisma";
import { ScheduleEditor } from "@/components/admin/ScheduleEditor";
import { BlockedDateManager } from "@/components/admin/BlockedDateManager";

export default async function SchedulePage() {
  const [workingHours, blockedDates] = await Promise.all([
    prisma.workingHours.findMany({ orderBy: { dayOfWeek: "asc" } }),
    prisma.blockedDate.findMany({ orderBy: { date: "asc" } }),
  ]);

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Horários e Disponibilidade</h1>

      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Horário de Funcionamento</h2>
          <ScheduleEditor initialHours={workingHours} />
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Datas Bloqueadas</h2>
          <BlockedDateManager initialBlocked={blockedDates} />
        </div>
      </div>
    </div>
  );
}
