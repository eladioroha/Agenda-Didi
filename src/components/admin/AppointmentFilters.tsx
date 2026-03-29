"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function AppointmentFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`/admin/appointments?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-3">
      <select
        value={searchParams.get("status") || ""}
        onChange={(e) => updateParam("status", e.target.value)}
        className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
      >
        <option value="">Todos os status</option>
        <option value="PENDING">Pendente</option>
        <option value="CONFIRMED">Confirmado</option>
        <option value="COMPLETED">Concluído</option>
        <option value="CANCELLED">Cancelado</option>
        <option value="NO_SHOW">Não Compareceu</option>
      </select>

      <input
        type="date"
        value={searchParams.get("date") || ""}
        onChange={(e) => updateParam("date", e.target.value)}
        className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
      />

      {(searchParams.get("status") || searchParams.get("date")) && (
        <button
          onClick={() => router.push("/admin/appointments")}
          className="px-3 py-2 text-sm text-gray-500 hover:text-gray-900 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
        >
          Limpar filtros
        </button>
      )}
    </div>
  );
}
