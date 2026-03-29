"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface BlockedDate {
  id: string;
  date: Date | string;
  reason?: string | null;
}

export function BlockedDateManager({ initialBlocked }: { initialBlocked: BlockedDate[] }) {
  const router = useRouter();
  const [newDate, setNewDate] = useState("");
  const [newReason, setNewReason] = useState("");
  const [loading, setLoading] = useState(false);

  async function addBlocked() {
    if (!newDate) return;
    setLoading(true);
    await fetch("/api/schedule/blocked-dates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: newDate, reason: newReason }),
    });
    setNewDate("");
    setNewReason("");
    setLoading(false);
    router.refresh();
  }

  async function removeBlocked(id: string) {
    await fetch(`/api/schedule/blocked-dates?id=${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div>
      <div className="flex gap-3 mb-4">
        <input
          type="date"
          value={newDate}
          onChange={(e) => setNewDate(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
        <input
          type="text"
          value={newReason}
          onChange={(e) => setNewReason(e.target.value)}
          placeholder="Motivo (opcional)"
          className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
        <button
          onClick={addBlocked}
          disabled={!newDate || loading}
          className="px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
        >
          Bloquear
        </button>
      </div>

      {initialBlocked.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">Nenhuma data bloqueada</p>
      ) : (
        <ul className="space-y-2">
          {initialBlocked.map((b) => (
            <li key={b.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <div>
                <span className="text-sm font-medium text-gray-900 capitalize">
                  {format(new Date(b.date), "EEEE, dd/MM/yyyy", { locale: ptBR })}
                </span>
                {b.reason && <span className="text-xs text-gray-400 ml-2">– {b.reason}</span>}
              </div>
              <button
                onClick={() => removeBlocked(b.id)}
                className="text-gray-400 hover:text-red-600 text-sm transition-colors"
              >
                Remover
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
