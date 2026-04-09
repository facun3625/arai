import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function verifyAdmin(adminId: string | null) {
  if (!adminId) return false;
  const user = await prisma.user.findUnique({ where: { id: adminId } });
  return user?.role === "ADMIN";
}

export async function GET(req: NextRequest) {
  const adminId = req.nextUrl.searchParams.get("adminId");
  if (!await verifyAdmin(adminId)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const docs = await prisma.knowledgeDocument.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(docs);
}

export async function POST(req: NextRequest) {
  const { adminId, title, content } = await req.json();
  if (!await verifyAdmin(adminId)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!title || !content) {
    return NextResponse.json({ error: "title y content requeridos" }, { status: 400 });
  }

  const doc = await prisma.knowledgeDocument.create({ data: { title, content } });
  return NextResponse.json(doc, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const { adminId, id, title, content, isActive } = await req.json();
  if (!await verifyAdmin(adminId)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!id) {
    return NextResponse.json({ error: "id requerido" }, { status: 400 });
  }

  const doc = await prisma.knowledgeDocument.update({
    where: { id },
    data: {
      ...(title && { title }),
      ...(content && { content }),
      ...(isActive !== undefined && { isActive }),
    },
  });
  return NextResponse.json(doc);
}

export async function DELETE(req: NextRequest) {
  const adminId = req.nextUrl.searchParams.get("adminId");
  const id = req.nextUrl.searchParams.get("id");
  if (!await verifyAdmin(adminId)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!id) {
    return NextResponse.json({ error: "id requerido" }, { status: 400 });
  }

  await prisma.knowledgeDocument.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
