import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const promotions = await prisma.categoryPromotion.findMany({
            include: { category: { select: { id: true, name: true, slug: true } } },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(promotions);
    } catch (error) {
        return NextResponse.json({ error: "Error al obtener promociones" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { categoryId, isActive } = body;

        if (!categoryId) {
            return NextResponse.json({ error: "La categoría es obligatoria" }, { status: 400 });
        }

        const promotion = await prisma.categoryPromotion.upsert({
            where: { categoryId },
            update: { isActive: isActive !== false },
            create: { categoryId, isActive: isActive !== false },
            include: { category: { select: { id: true, name: true, slug: true } } }
        });

        return NextResponse.json(promotion);
    } catch (error) {
        return NextResponse.json({ error: "Error al guardar la promoción" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) return NextResponse.json({ error: "ID obligatorio" }, { status: 400 });

        await prisma.categoryPromotion.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Error al eliminar la promoción" }, { status: 500 });
    }
}
