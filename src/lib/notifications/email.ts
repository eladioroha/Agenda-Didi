import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!transporter) {
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    if (!user || !pass || user === "your@gmail.com") {
      return null;
    }
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: { user, pass },
    });
  }
  return transporter;
}

export async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<void> {
  const t = getTransporter();
  if (!t) {
    console.log("[Email MOCK]", to, "|", subject);
    return;
  }

  const from = `"${process.env.BARBERSHOP_NAME || "Barbearia"}" <${process.env.SMTP_FROM}>`;
  await t.sendMail({ from, to, subject, html });
}
