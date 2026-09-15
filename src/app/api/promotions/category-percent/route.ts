import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const discounts = await prisma.categoryDiscount.findMany({
            include: { category: { select: { id: true, name: true, slug: true } } },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(discounts);
    } catch (error) {
        return NextResponse.json({ error: "Error al obtener descuentos" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { categoryId, percentage, isActive } = body;

        if (!categoryId) {
            return NextResponse.json({ error: "La categoría es obligatoria" }, { status: 400 });
        }
        const pct = Number(percentage);
        if (!Number.isFinite(pct) || pct <= 0 || pct > 100) {
            return NextResponse.json({ error: "El porcentaje debe ser mayor a 0 y menor o igual a 100" }, { status: 400 });
        }

        const discount = await prisma.categoryDiscount.upsert({
            where: { categoryId },
            update: { percentage: pct, isActive: isActive !== false },
            create: { categoryId, percentage: pct, isActive: isActive !== false },
            include: { category: { select: { id: true, name: true, slug: true } } }
        });

        return NextResponse.json(discount);
    } catch (error) {
        return NextResponse.json({ error: "Error al guardar el descuento" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) return NextResponse.json({ error: "ID obligatorio" }, { status: 400 });

        await prisma.categoryDiscount.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Error al eliminar el descuento" }, { status: 500 });
    }
}
