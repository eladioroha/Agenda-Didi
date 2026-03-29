import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const hours = await prisma.workingHours.findMany({
    orderBy: { dayOfWeek: "asc" },
  });
  return NextResponse.json(hours);
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session.adminId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await req.json();
  if (!Array.isArray(body)) {
    return NextResponse.json({ error: "Array esperado" }, { status: 400 });
  }

  const updates = await Promise.all(
    body.map((item) =>
      prisma.workingHours.update({
        where: { id: item.id },
        data: {
          isOpen: item.isOpen,
          openTime: item.openTime,
          closeTime: item.closeTime,
          slotGapMins: item.slotGapMins,
        },
      })
    )
  );

  return NextResponse.json(updates);
}
