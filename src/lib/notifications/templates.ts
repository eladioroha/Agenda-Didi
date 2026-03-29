import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toZonedTime } from "date-fns-tz";
import { NotificationEvent, AppointmentWithService } from "@/types";

const TIMEZONE = process.env.TZ || "America/Sao_Paulo";
const BARBERSHOP = process.env.BARBERSHOP_NAME || "Barbearia";

function formatDateTime(date: Date) {
  const zoned = toZonedTime(date, TIMEZONE);
  return {
    date: format(zoned, "dd/MM/yyyy", { locale: ptBR }),
    time: format(zoned, "HH:mm", { locale: ptBR }),
    weekday: format(zoned, "EEEE", { locale: ptBR }),
  };
}

export function getWhatsAppMessage(
  event: NotificationEvent,
  appt: AppointmentWithService
): string {
  const { date, time, weekday } = formatDateTime(appt.startTime);
  const price = appt.service.price.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  switch (event) {
    case "CONFIRMATION":
      return (
        `✂️ *${BARBERSHOP}*\n\n` +
        `Olá, *${appt.clientName}*!\n\n` +
        `Seu agendamento foi *confirmado* com sucesso! ✅\n\n` +
        `📅 *Data:* ${weekday}, ${date}\n` +
        `🕐 *Horário:* ${time}\n` +
        `💈 *Serviço:* ${appt.service.name}\n` +
        `💰 *Valor:* ${price}\n\n` +
        `Qualquer dúvida, estamos à disposição. Até logo! 👋`
      );

    case "MODIFICATION":
      return (
        `✂️ *${BARBERSHOP}*\n\n` +
        `Olá, *${appt.clientName}*!\n\n` +
        `Seu agendamento foi *reagendado*. 🔄\n\n` +
        `📅 *Nova data:* ${weekday}, ${date}\n` +
        `🕐 *Novo horário:* ${time}\n` +
        `💈 *Serviço:* ${appt.service.name}\n\n` +
        `Até logo! 👋`
      );

    case "CANCELLATION":
      return (
        `✂️ *${BARBERSHOP}*\n\n` +
        `Olá, *${appt.clientName}*!\n\n` +
        `Seu agendamento do dia *${date} às ${time}* foi *cancelado*. ❌\n\n` +
        `Para agendar novamente, acesse nosso link de agendamento. 😊`
      );

    case "REMINDER":
      return (
        `✂️ *${BARBERSHOP}*\n\n` +
        `Olá, *${appt.clientName}*! 👋\n\n` +
        `🔔 *Lembrete:* você tem um agendamento *amanhã*!\n\n` +
        `📅 *Data:* ${weekday}, ${date}\n` +
        `🕐 *Horário:* ${time}\n` +
        `💈 *Serviço:* ${appt.service.name}\n\n` +
        `Até amanhã! ✂️`
      );
  }
}

export function getEmailContent(
  event: NotificationEvent,
  appt: AppointmentWithService
): { subject: string; html: string } {
  const { date, time, weekday } = formatDateTime(appt.startTime);
  const price = appt.service.price.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  const baseStyle = `
    font-family: Arial, sans-serif;
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
    background-color: #f9fafb;
  `;
  const cardStyle = `
    background: white;
    border-radius: 8px;
    padding: 30px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  `;
  const headerStyle = `
    background-color: #1a1a1a;
    color: white;
    padding: 20px 30px;
    border-radius: 8px 8px 0 0;
    text-align: center;
  `;
  const infoRowStyle = `
    display: flex;
    padding: 8px 0;
    border-bottom: 1px solid #f0f0f0;
  `;
  const labelStyle = `color: #6b7280; font-size: 14px; width: 120px; flex-shrink: 0;`;
  const valueStyle = `font-weight: 600; font-size: 14px; color: #111827;`;

  const infoRows = (
    `<div style="${infoRowStyle}"><span style="${labelStyle}">Data:</span><span style="${valueStyle}">${weekday}, ${date}</span></div>` +
    `<div style="${infoRowStyle}"><span style="${labelStyle}">Horário:</span><span style="${valueStyle}">${time}</span></div>` +
    `<div style="${infoRowStyle}"><span style="${labelStyle}">Serviço:</span><span style="${valueStyle}">${appt.service.name}</span></div>`
  );

  switch (event) {
    case "CONFIRMATION":
      return {
        subject: `✅ Agendamento confirmado – ${BARBERSHOP}`,
        html: `
          <div style="${baseStyle}">
            <div style="${headerStyle}">
              <h1 style="margin:0;font-size:22px;">✂️ ${BARBERSHOP}</h1>
            </div>
            <div style="${cardStyle}">
              <h2 style="color:#16a34a;margin-top:0;">Agendamento Confirmado!</h2>
              <p>Olá, <strong>${appt.clientName}</strong>! Seu agendamento foi confirmado.</p>
              ${infoRows}
              <div style="${infoRowStyle}"><span style="${labelStyle}">Valor:</span><span style="${valueStyle}">${price}</span></div>
              <p style="margin-top:20px;color:#6b7280;font-size:14px;">Até logo! ✂️</p>
            </div>
          </div>`,
      };

    case "MODIFICATION":
      return {
        subject: `🔄 Agendamento reagendado – ${BARBERSHOP}`,
        html: `
          <div style="${baseStyle}">
            <div style="${headerStyle}">
              <h1 style="margin:0;font-size:22px;">✂️ ${BARBERSHOP}</h1>
            </div>
            <div style="${cardStyle}">
              <h2 style="color:#2563eb;margin-top:0;">Agendamento Reagendado</h2>
              <p>Olá, <strong>${appt.clientName}</strong>! Seu agendamento foi reagendado para:</p>
              ${infoRows}
              <p style="margin-top:20px;color:#6b7280;font-size:14px;">Até logo! ✂️</p>
            </div>
          </div>`,
      };

    case "CANCELLATION":
      return {
        subject: `❌ Agendamento cancelado – ${BARBERSHOP}`,
        html: `
          <div style="${baseStyle}">
            <div style="${headerStyle}">
              <h1 style="margin:0;font-size:22px;">✂️ ${BARBERSHOP}</h1>
            </div>
            <div style="${cardStyle}">
              <h2 style="color:#dc2626;margin-top:0;">Agendamento Cancelado</h2>
              <p>Olá, <strong>${appt.clientName}</strong>! Seu agendamento foi cancelado.</p>
              ${infoRows}
              <p style="margin-top:20px;">Para reagendar, acesse nosso link de agendamento.</p>
            </div>
          </div>`,
      };

    case "REMINDER":
      return {
        subject: `🔔 Lembrete: amanhã você tem horário – ${BARBERSHOP}`,
        html: `
          <div style="${baseStyle}">
            <div style="${headerStyle}">
              <h1 style="margin:0;font-size:22px;">✂️ ${BARBERSHOP}</h1>
            </div>
            <div style="${cardStyle}">
              <h2 style="color:#d97706;margin-top:0;">Lembrete de Agendamento</h2>
              <p>Olá, <strong>${appt.clientName}</strong>! Lembramos que você tem um horário <strong>amanhã</strong>.</p>
              ${infoRows}
              <p style="margin-top:20px;color:#6b7280;font-size:14px;">Até amanhã! ✂️</p>
            </div>
          </div>`,
      };
  }
}
