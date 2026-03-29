"use client";

import { useState } from "react";
import { WorkingHoursData, DAY_NAMES } from "@/types";

export function ScheduleEditor({ initialHours }: { initialHours: WorkingHoursData[] }) {
  const [hours, setHours] = useState(initialHours);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update(id: string, field: string, value: unknown) {
    setHours((prev) =>
      prev.map((h) => (h.id === id ? { ...h, [field]: value } : h))
    );
    setSaved(false);
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/schedule", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(hours),
      });
      if (!res.ok) throw new Error("Erro ao salvar");
      setSaved(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="space-y-4">
        {hours.map((h) => (
          <div key={h.id} className={`flex flex-wrap items-center gap-3 py-3 border-b border-gray-50 last:border-0 ${!h.isOpen ? "opacity-50" : ""}`}>
            <div className="w-32">
              <span className="text-sm font-medium text-gray-700">{DAY_NAMES[h.dayOfWeek]}</span>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <div
                onClick={() => update(h.id, "isOpen", !h.isOpen)}
                className={`w-10 h-5 rounded-full transition-colors cursor-pointer ${h.isOpen ? "bg-gray-900" : "bg-gray-200"}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full mt-0.5 transition-transform shadow ${h.isOpen ? "translate-x-5 ml-0.5" : "translate-x-0.5"}`} />
              </div>
              <span className="text-sm text-gray-500">{h.isOpen ? "Aberto" : "Fechado"}</span>
            </label>
            {h.isOpen && (
              <>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-400">De</label>
                  <input
                    type="time"
                    value={h.openTime}
                    onChange={(e) => update(h.id, "openTime", e.target.value)}
                    className="px-2 py-1 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-400">até</label>
                  <input
                    type="time"
                    value={h.closeTime}
                    onChange={(e) => update(h.id, "closeTime", e.target.value)}
                    className="px-2 py-1 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-400">Intervalo</label>
                  <select
                    value={h.slotGapMins}
                    onChange={(e) => update(h.id, "slotGapMins", Number(e.target.value))}
                    className="px-2 py-1 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  >
                    {[15, 20, 30, 45, 60].map((v) => (
                      <option key={v} value={v}>{v}min</option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {error && <p className="text-red-600 text-sm mt-3">{error}</p>}

      <button
        onClick={save}
        disabled={saving}
        className="mt-4 px-6 py-2 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
      >
        {saving ? "Salvando..." : saved ? "✓ Salvo!" : "Salvar Alterações"}
      </button>
    </div>
  );
}
