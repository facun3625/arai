import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const restrictions = await prisma.zipCodeRestriction.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(restrictions);
    } catch (error) {
        console.error("Error fetching zip code restrictions:", error);
        return NextResponse.json({ error: "Error al obtener restricciones" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { zipCode, type, message, address, phone } = body;

        if (!zipCode || !type) {
            return NextResponse.json({ error: "CP y tipo son obligatorios" }, { status: 400 });
        }

        const restriction = await prisma.zipCodeRestriction.upsert({
            where: {
                zipCode_type: { zipCode, type }
            },
            update: {
                message,
                address,
                phone
            },
            create: {
                zipCode,
                type,
                message,
                address,
                phone
            }
        });

        return NextResponse.json(restriction);
    } catch (error) {
        console.error("Error saving zip code restriction:", error);
        return NextResponse.json({ error: "Error al guardar restricción" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "ID obligatorio" }, { status: 400 });
        }

        await prisma.zipCodeRestriction.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting zip code restriction:", error);
        return NextResponse.json({ error: "Error al eliminar restricción" }, { status: 500 });
    }
}
