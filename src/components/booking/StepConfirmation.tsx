"use client";

import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ServiceData } from "@/types";

interface Props {
  serviceId: string;
  date: string;
  time: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  notes?: string;
  submitting: boolean;
  error: string | null;
  onConfirm: () => void;
  onBack: () => void;
}

export function StepConfirmation({
  serviceId, date, time, clientName, clientPhone, clientEmail, notes,
  submitting, error, onConfirm, onBack,
}: Props) {
  const [service, setService] = useState<ServiceData | null>(null);

  useEffect(() => {
    fetch(`/api/services/${serviceId}`).then((r) => r.json()).then(setService);
  }, [serviceId]);

  const formattedDate = format(parseISO(date), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR });

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-1">Confirme seu agendamento</h2>
      <p className="text-gray-500 text-sm mb-6">Revise os dados antes de confirmar</p>

      <div className="bg-gray-50 rounded-xl p-5 space-y-3 mb-6">
        <Row label="Serviço" value={service?.name || "..."} />
        <Row label="Valor" value={service ? service.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "..."} />
        <Row label="Duração" value={service ? `${service.durationMins} minutos` : "..."} />
        <div className="border-t border-gray-200 my-2" />
        <Row label="Data" value={<span className="capitalize">{formattedDate}</span>} />
        <Row label="Horário" value={time} />
        <div className="border-t border-gray-200 my-2" />
        <Row label="Nome" value={clientName} />
        <Row label="WhatsApp" value={clientPhone} />
        {clientEmail && <Row label="Email" value={clientEmail} />}
        {notes && <Row label="Obs." value={notes} />}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-4 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onBack}
          disabled={submitting}
          className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-colors font-medium"
        >
          Voltar
        </button>
        <button
          onClick={onConfirm}
          disabled={submitting}
          className="flex-1 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 disabled:opacity-50 transition-colors font-medium flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Agendando...
            </>
          ) : (
            "Confirmar"
          )}
        </button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <span className="text-sm text-gray-500 w-24 flex-shrink-0">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value}</span>
    </div>
  );
}
