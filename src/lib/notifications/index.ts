import { NotificationEvent, AppointmentWithService } from "@/types";
import { sendWhatsApp } from "./whatsapp";
import { sendEmail } from "./email";
import { getWhatsAppMessage, getEmailContent } from "./templates";

export async function sendNotification(
  appointment: AppointmentWithService,
  event: NotificationEvent
): Promise<void> {
  try {
    const whatsappMsg = getWhatsAppMessage(event, appointment);
    const emailContent = getEmailContent(event, appointment);

    const tasks: Promise<void>[] = [
      sendWhatsApp(appointment.clientPhone, whatsappMsg),
    ];

    if (appointment.clientEmail) {
      tasks.push(
        sendEmail(
          appointment.clientEmail,
          emailContent.subject,
          emailContent.html
        )
      );
    }

    const results = await Promise.allSettled(tasks);
    results.forEach((result, i) => {
      if (result.status === "rejected") {
        console.error(
          `[Notification] channel ${i} failed:`,
          result.reason
        );
      }
    });
  } catch (err) {
    console.error("[Notification] Unexpected error:", err);
  }
}
