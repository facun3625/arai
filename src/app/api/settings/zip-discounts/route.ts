import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const zipCode = searchParams.get("zipCode");

        if (zipCode) {
            const discount = await prisma.zipCodeDiscount.findUnique({
                where: { zipCode }
            });
            return NextResponse.json(discount || null);
        }

        const discounts = await prisma.zipCodeDiscount.findMany({
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
        const { zipCode, discountType, discountValue, label, isActive, id } = body;

        if (!zipCode || !discountType || discountValue === undefined) {
            return NextResponse.json({ error: "CP, tipo y valor son obligatorios" }, { status: 400 });
        }

        if (id) {
            const updated = await prisma.zipCodeDiscount.update({
                where: { id },
                data: { zipCode, discountType, discountValue: Number(discountValue), label: label || null, isActive: isActive !== false }
            });
            return NextResponse.json(updated);
        }

        const discount = await prisma.zipCodeDiscount.upsert({
            where: { zipCode },
            update: { discountType, discountValue: Number(discountValue), label: label || null, isActive: isActive !== false },
            create: { zipCode, discountType, discountValue: Number(discountValue), label: label || null, isActive: isActive !== false }
        });

        return NextResponse.json(discount);
    } catch (error) {
        return NextResponse.json({ error: "Error al guardar descuento" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) return NextResponse.json({ error: "ID obligatorio" }, { status: 400 });

        await prisma.zipCodeDiscount.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Error al eliminar descuento" }, { status: 500 });
    }
}
