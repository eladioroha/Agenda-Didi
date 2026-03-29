"use client";

import { useState } from "react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isBefore, startOfDay, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Props {
  serviceId: string;
  selectedDate?: string;
  onSelect: (date: string) => void;
  onBack: () => void;
}

export function StepDatePicker({ serviceId, selectedDate, onSelect, onBack }: Props) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const today = startOfDay(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startOffset = getDay(monthStart); // 0=Sun

  function handleSelect(day: Date) {
    if (isBefore(day, today)) return;
    onSelect(format(day, "yyyy-MM-dd"));
  }

  const selected = selectedDate ? new Date(selectedDate + "T00:00:00") : null;

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-1">Escolha a data</h2>
      <p className="text-gray-500 text-sm mb-6">Selecione o dia do seu agendamento</p>

      <div className="max-w-sm mx-auto">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            disabled={isBefore(subMonths(currentMonth, 1), startOfMonth(today))}
            className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="font-semibold text-gray-900 capitalize">
            {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
          </span>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => (
            <div key={d} className="text-center text-xs text-gray-400 font-medium py-2">
              {d}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: startOffset }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {days.map((day) => {
            const isPast = isBefore(day, today);
            const isSelected = selected && isSameDay(day, selected);
            const isToday = isSameDay(day, today);

            return (
              <button
                key={day.toISOString()}
                onClick={() => handleSelect(day)}
                disabled={isPast}
                className={`
                  aspect-square rounded-full flex items-center justify-center text-sm font-medium transition-colors
                  ${isPast ? "text-gray-200 cursor-not-allowed" : "hover:bg-gray-100 cursor-pointer"}
                  ${isSelected ? "!bg-gray-900 !text-white" : ""}
                  ${isToday && !isSelected ? "border-2 border-gray-900 text-gray-900" : ""}
                `}
              >
                {format(day, "d")}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex gap-3 mt-8">
        <button
          onClick={onBack}
          className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
        >
          Voltar
        </button>
      </div>
    </div>
  );
}
