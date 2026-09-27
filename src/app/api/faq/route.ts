import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const admin = searchParams.get("admin");
        const adminId = searchParams.get("adminId");

        if (admin) {
            if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            const requester = await prisma.user.findUnique({ where: { id: adminId } });
            if (!requester || requester.role !== "ADMIN") {
                return NextResponse.json({ error: "Forbidden" }, { status: 403 });
            }
            const items = await prisma.faqItem.findMany({ orderBy: { order: "asc" } });
            return NextResponse.json(items);
        }

        const items = await prisma.faqItem.findMany({
            where: { isActive: true },
            orderBy: { order: "asc" },
        });
        return NextResponse.json(items);
    } catch (error) {
        console.error("GET FAQ ERROR:", error);
        return NextResponse.json({ error: "Error al obtener las preguntas frecuentes" }, { status: 500 });
    }
}

async function assertAdmin(adminId: string | undefined) {
    if (!adminId) return false;
    const requester = await prisma.user.findUnique({ where: { id: adminId } });
    return Boolean(requester && requester.role === "ADMIN");
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { adminId, question, answer, order } = body;

        if (!(await assertAdmin(adminId))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        if (!question?.trim() || !answer?.trim()) {
            return NextResponse.json({ error: "Pregunta y respuesta son requeridas" }, { status: 400 });
        }

        const maxOrder = await prisma.faqItem.aggregate({ _max: { order: true } });
        const item = await prisma.faqItem.create({
            data: {
                question: question.trim(),
                answer: answer.trim(),
                order: order ?? ((maxOrder._max.order ?? -1) + 1),
            },
        });
        return NextResponse.json(item);
    } catch (error) {
        console.error("POST FAQ ERROR:", error);
        return NextResponse.json({ error: "Error al crear la pregunta" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const { id, adminId, question, answer, order, isActive } = body;

        if (!(await assertAdmin(adminId))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        if (!id) return NextResponse.json({ error: "id requerido" }, { status: 400 });

        const item = await prisma.faqItem.update({
            where: { id },
            data: {
                ...(question !== undefined && { question: question.trim() }),
                ...(answer !== undefined && { answer: answer.trim() }),
                ...(order !== undefined && { order }),
                ...(isActive !== undefined && { isActive: Boolean(isActive) }),
            },
        });
        return NextResponse.json(item);
    } catch (error) {
        console.error("PUT FAQ ERROR:", error);
        return NextResponse.json({ error: "Error al actualizar la pregunta" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        const adminId = searchParams.get("adminId") || undefined;

        if (!(await assertAdmin(adminId))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        if (!id) return NextResponse.json({ error: "id requerido" }, { status: 400 });

        await prisma.faqItem.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE FAQ ERROR:", error);
        return NextResponse.json({ error: "Error al eliminar la pregunta" }, { status: 500 });
    }
}
