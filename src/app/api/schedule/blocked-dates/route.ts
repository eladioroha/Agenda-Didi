import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

async function requireAdmin() {
  const session = await getSession();
  return session.adminId ? session : null;
}

export async function GET() {
  const blocked = await prisma.blockedDate.findMany({
    orderBy: { date: "asc" },
  });
  return NextResponse.json(blocked);
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { date, reason } = await req.json();
  if (!date) return NextResponse.json({ error: "Data obrigatória" }, { status: 400 });

  const blocked = await prisma.blockedDate.create({
    data: { date: new Date(date), reason: reason || null },
  });

  return NextResponse.json(blocked, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });

  await prisma.blockedDate.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
