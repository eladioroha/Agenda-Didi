"use client";

import { useEffect, useState } from "react";
import { ServiceData } from "@/types";

interface Props {
  onSelect: (serviceId: string) => void;
}

export function StepServiceSelect({ onSelect }: Props) {
  const [services, setServices] = useState<ServiceData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/services?active=true")
      .then((r) => r.json())
      .then(setServices)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-1">Escolha o serviço</h2>
      <p className="text-gray-500 text-sm mb-6">Selecione o serviço que deseja agendar</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {services.map((s) => (
          <button
            key={s.id}
            onClick={() => onSelect(s.id)}
            className="text-left p-5 border-2 border-gray-100 rounded-xl hover:border-gray-900 hover:bg-gray-50 transition-all group"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-gray-900 group-hover:text-gray-900">{s.name}</h3>
              <span className="text-lg font-bold text-gray-900">
                {s.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </span>
            </div>
            {s.description && (
              <p className="text-sm text-gray-500 mb-3">{s.description}</p>
            )}
            <div className="flex items-center text-xs text-gray-400">
              <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {s.durationMins} minutos
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
