"use client";

import { useState } from "react";

interface ContactData {
  clientName?: string;
  clientPhone?: string;
  clientEmail?: string;
  notes?: string;
}

interface Props {
  initialData: ContactData;
  onNext: (data: Required<Pick<ContactData, "clientName" | "clientPhone">> & Pick<ContactData, "clientEmail" | "notes">) => void;
  onBack: () => void;
}

export function StepContactInfo({ initialData, onNext, onBack }: Props) {
  const [form, setForm] = useState({
    clientName: initialData.clientName || "",
    clientPhone: initialData.clientPhone || "",
    clientEmail: initialData.clientEmail || "",
    notes: initialData.notes || "",
  });
  const [errors, setErrors] = useState<Partial<typeof form>>({});

  function validate() {
    const errs: Partial<typeof form> = {};
    if (form.clientName.trim().length < 2) errs.clientName = "Nome deve ter pelo menos 2 caracteres";
    if (!/^\+?[1-9]\d{7,14}$/.test(form.clientPhone.replace(/\s/g, ""))) {
      errs.clientPhone = "Telefone inválido. Ex: +5511999998888";
    }
    if (form.clientEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.clientEmail)) {
      errs.clientEmail = "Email inválido";
    }
    return errs;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onNext({
      clientName: form.clientName.trim(),
      clientPhone: form.clientPhone.replace(/\s/g, ""),
      clientEmail: form.clientEmail.trim() || undefined,
      notes: form.notes.trim() || undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-xl font-semibold text-gray-900 mb-1">Seus dados</h2>
      <p className="text-gray-500 text-sm mb-6">Preencha seus dados para confirmar o agendamento</p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome completo <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.clientName}
            onChange={(e) => { setForm({ ...form, clientName: e.target.value }); setErrors({ ...errors, clientName: undefined }); }}
            placeholder="Seu nome"
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 transition-colors ${
              errors.clientName ? "border-red-300" : "border-gray-200"
            }`}
          />
          {errors.clientName && <p className="text-red-500 text-xs mt-1">{errors.clientName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            WhatsApp / Telefone <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={form.clientPhone}
            onChange={(e) => { setForm({ ...form, clientPhone: e.target.value }); setErrors({ ...errors, clientPhone: undefined }); }}
            placeholder="+55 11 99999-8888"
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 transition-colors ${
              errors.clientPhone ? "border-red-300" : "border-gray-200"
            }`}
          />
          {errors.clientPhone && <p className="text-red-500 text-xs mt-1">{errors.clientPhone}</p>}
          <p className="text-xs text-gray-400 mt-1">Será usado para envio de confirmação via WhatsApp</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email <span className="text-gray-400 text-xs">(opcional)</span>
          </label>
          <input
            type="email"
            value={form.clientEmail}
            onChange={(e) => { setForm({ ...form, clientEmail: e.target.value }); setErrors({ ...errors, clientEmail: undefined }); }}
            placeholder="seu@email.com"
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 transition-colors ${
              errors.clientEmail ? "border-red-300" : "border-gray-200"
            }`}
          />
          {errors.clientEmail && <p className="text-red-500 text-xs mt-1">{errors.clientEmail}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Observações <span className="text-gray-400 text-xs">(opcional)</span>
          </label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Alguma observação especial?"
            rows={3}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 transition-colors resize-none"
          />
        </div>
      </div>

      <div className="flex gap-3 mt-8">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
        >
          Voltar
        </button>
        <button
          type="submit"
          className="flex-1 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium"
        >
          Continuar
        </button>
      </div>
    </form>
  );
}
