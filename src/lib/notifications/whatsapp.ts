import twilio from "twilio";

let client: ReturnType<typeof twilio> | null = null;

function getClient() {
  if (!client) {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    if (!sid || !token || sid.startsWith("AC")) {
      // Only initialize if real credentials are set
      if (sid && token && sid !== "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx") {
        client = twilio(sid, token);
      }
    }
  }
  return client;
}

export async function sendWhatsApp(to: string, body: string): Promise<void> {
  const twilioClient = getClient();
  if (!twilioClient) {
    console.log("[WhatsApp MOCK]", to, ":", body.slice(0, 80) + "...");
    return;
  }

  const from = process.env.TWILIO_WHATSAPP_NUMBER;
  await twilioClient.messages.create({
    from: `whatsapp:${from}`,
    to: `whatsapp:${to}`,
    body,
  });
}
