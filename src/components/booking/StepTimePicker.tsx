"use client";

import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Props {
  serviceId: string;
  date: string;
  onSelect: (time: string) => void;
  onBack: () => void;
}

export function StepTimePicker({ serviceId, date, onSelect, onBack }: Props) {
  const [slots, setSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setSlots([]);
    fetch(`/api/availability?date=${date}&serviceId=${serviceId}`)
      .then((r) => r.json())
      .then((data) => setSlots(data.slots || []))
      .finally(() => setLoading(false));
  }, [date, serviceId]);

  const formattedDate = format(parseISO(date), "EEEE, dd 'de' MMMM", { locale: ptBR });

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-1">Escolha o horário</h2>
      <p className="text-gray-500 text-sm mb-6 capitalize">{formattedDate}</p>

      {loading ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : slots.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">Sem horários disponíveis</p>
          <p className="text-gray-400 text-sm mt-1">Escolha outra data</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {slots.map((slot) => (
            <button
              key={slot}
              onClick={() => setSelected(slot)}
              className={`py-3 rounded-xl text-sm font-semibold border-2 transition-all ${
                selected === slot
                  ? "border-gray-900 bg-gray-900 text-white"
                  : "border-gray-100 hover:border-gray-300 text-gray-700"
              }`}
            >
              {slot}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-3 mt-8">
        <button
          onClick={onBack}
          className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
        >
          Voltar
        </button>
        <button
          onClick={() => selected && onSelect(selected)}
          disabled={!selected}
          className="flex-1 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}
