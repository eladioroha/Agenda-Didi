import { NextRequest, NextResponse } from "next/server";
import { getAvailableSlots } from "@/lib/availability";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const serviceId = searchParams.get("serviceId");

  if (!date || !serviceId) {
    return NextResponse.json(
      { error: "Parâmetros 'date' e 'serviceId' são obrigatórios" },
      { status: 400 }
    );
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Formato de data inválido" }, { status: 400 });
  }

  try {
    const slots = await getAvailableSlots(date, serviceId);
    return NextResponse.json({ slots });
  } catch (err) {
    console.error("[Availability]", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
