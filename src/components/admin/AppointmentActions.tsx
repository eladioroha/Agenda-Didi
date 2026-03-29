"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppointmentWithService, STATUS_LABELS } from "@/types";

const ACTIONS: Array<{
  status: string;
  label: string;
  color: string;
}> = [
  { status: "CONFIRMED", label: "Confirmar", color: "bg-green-600 hover:bg-green-700 text-white" },
  { status: "COMPLETED", label: "Marcar Concluído", color: "bg-gray-900 hover:bg-gray-800 text-white" },
  { status: "NO_SHOW", label: "Não Compareceu", color: "bg-orange-500 hover:bg-orange-600 text-white" },
  { status: "CANCELLED", label: "Cancelar", color: "bg-red-600 hover:bg-red-700 text-white" },
];

export function AppointmentActions({
  appointment,
}: {
  appointment: AppointmentWithService;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function updateStatus(status: string) {
    setLoading(status);
    setError(null);
    try {
      const res = await fetch(`/api/appointments/${appointment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Erro ao atualizar");
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(null);
    }
  }

  const availableActions = ACTIONS.filter((a) => a.status !== appointment.status);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h3 className="font-semibold text-gray-900 mb-4">Ações</h3>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {availableActions.map(({ status, label, color }) => (
          <button
            key={status}
            onClick={() => updateStatus(status)}
            disabled={!!loading}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 ${color}`}
          >
            {loading === status ? "..." : label}
          </button>
        ))}
      </div>
    </div>
  );
}
