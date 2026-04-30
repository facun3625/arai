import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const adminId = searchParams.get("adminId");

  if (!adminId) return NextResponse.json({ error: "adminId requerido" }, { status: 400 });

  const admin = await prisma.user.findUnique({ where: { id: adminId } });
  if (!admin || admin.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const conversations = await prisma.conversation.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        select: { id: true, role: true, content: true, createdAt: true },
      },
    },
  });

  return NextResponse.json({ conversations });
}
