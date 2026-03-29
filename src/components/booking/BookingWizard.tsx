"use client";

import { useReducer, useState } from "react";
import { StepServiceSelect } from "./StepServiceSelect";
import { StepDatePicker } from "./StepDatePicker";
import { StepTimePicker } from "./StepTimePicker";
import { StepContactInfo } from "./StepContactInfo";
import { StepConfirmation } from "./StepConfirmation";
import { ServiceData } from "@/types";

type Step = "service" | "date" | "time" | "contact" | "review";

interface BookingState {
  step: Step;
  serviceId?: string;
  date?: string;
  time?: string;
  clientName?: string;
  clientPhone?: string;
  clientEmail?: string;
  notes?: string;
}

type Action =
  | { type: "SELECT_SERVICE"; serviceId: string }
  | { type: "SELECT_DATE"; date: string }
  | { type: "SELECT_TIME"; time: string }
  | { type: "SET_CONTACT"; clientName: string; clientPhone: string; clientEmail?: string; notes?: string }
  | { type: "GO_BACK" }
  | { type: "RESET" };

const STEPS: Step[] = ["service", "date", "time", "contact", "review"];
const STEP_LABELS = ["Serviço", "Data", "Horário", "Contato", "Confirmação"];

function reducer(state: BookingState, action: Action): BookingState {
  switch (action.type) {
    case "SELECT_SERVICE":
      return { ...state, step: "date", serviceId: action.serviceId, date: undefined, time: undefined };
    case "SELECT_DATE":
      return { ...state, step: "time", date: action.date, time: undefined };
    case "SELECT_TIME":
      return { ...state, step: "contact", time: action.time };
    case "SET_CONTACT":
      return {
        ...state,
        step: "review",
        clientName: action.clientName,
        clientPhone: action.clientPhone,
        clientEmail: action.clientEmail,
        notes: action.notes,
      };
    case "GO_BACK": {
      const idx = STEPS.indexOf(state.step);
      return { ...state, step: STEPS[Math.max(0, idx - 1)] };
    }
    case "RESET":
      return { step: "service" };
    default:
      return state;
  }
}

export function BookingWizard() {
  const [state, dispatch] = useReducer(reducer, { step: "service" });
  const [submitting, setSubmitting] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currentStepIdx = STEPS.indexOf(state.step);

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: state.serviceId,
          date: state.date,
          time: state.time,
          clientName: state.clientName,
          clientPhone: state.clientPhone,
          clientEmail: state.clientEmail,
          notes: state.notes,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao agendar");
      }
      const data = await res.json();
      setBookingId(data.id);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (bookingId) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Agendamento Realizado!</h2>
        <p className="text-gray-600 mb-2">
          Seu agendamento foi confirmado. Você receberá uma notificação em breve.
        </p>
        <p className="text-sm text-gray-400 mb-8">Código: {bookingId}</p>
        <button
          onClick={() => { setBookingId(null); dispatch({ type: "RESET" }); }}
          className="px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors"
        >
          Fazer novo agendamento
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {STEP_LABELS.map((label, i) => (
            <div key={label} className="flex flex-col items-center flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold mb-1 transition-colors ${
                  i < currentStepIdx
                    ? "bg-green-500 text-white"
                    : i === currentStepIdx
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {i < currentStepIdx ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span className={`text-xs hidden sm:block ${i === currentStepIdx ? "text-gray-900 font-medium" : "text-gray-400"}`}>
                {label}
              </span>
            </div>
          ))}
        </div>
        <div className="relative h-1 bg-gray-100 rounded-full">
          <div
            className="absolute h-1 bg-gray-900 rounded-full transition-all duration-300"
            style={{ width: `${(currentStepIdx / (STEPS.length - 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* Step content */}
      {state.step === "service" && (
        <StepServiceSelect
          onSelect={(serviceId) => dispatch({ type: "SELECT_SERVICE", serviceId })}
        />
      )}
      {state.step === "date" && state.serviceId && (
        <StepDatePicker
          serviceId={state.serviceId}
          selectedDate={state.date}
          onSelect={(date) => dispatch({ type: "SELECT_DATE", date })}
          onBack={() => dispatch({ type: "GO_BACK" })}
        />
      )}
      {state.step === "time" && state.serviceId && state.date && (
        <StepTimePicker
          serviceId={state.serviceId}
          date={state.date}
          onSelect={(time) => dispatch({ type: "SELECT_TIME", time })}
          onBack={() => dispatch({ type: "GO_BACK" })}
        />
      )}
      {state.step === "contact" && (
        <StepContactInfo
          initialData={{
            clientName: state.clientName,
            clientPhone: state.clientPhone,
            clientEmail: state.clientEmail,
            notes: state.notes,
          }}
          onNext={(data) => dispatch({ type: "SET_CONTACT", ...data })}
          onBack={() => dispatch({ type: "GO_BACK" })}
        />
      )}
      {state.step === "review" && state.serviceId && state.date && state.time && state.clientName && state.clientPhone && (
        <StepConfirmation
          serviceId={state.serviceId}
          date={state.date}
          time={state.time}
          clientName={state.clientName}
          clientPhone={state.clientPhone}
          clientEmail={state.clientEmail}
          notes={state.notes}
          submitting={submitting}
          error={error}
          onConfirm={handleSubmit}
          onBack={() => dispatch({ type: "GO_BACK" })}
        />
      )}
    </div>
  );
}
