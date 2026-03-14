import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, slug, terms, isAddon } = body;

        if (!name || !slug) {
            return NextResponse.json({ error: "Nombre y slug requeridos" }, { status: 400 });
        }

        const attribute = await prisma.attribute.create({
            data: {
                name,
                slug,
                terms: terms || "",
                isAddon: Boolean(isAddon)
            }
        });

        return NextResponse.json(attribute);
    } catch (error: any) {
        console.error("CREATE ATTRIBUTE ERROR:", error);
        return NextResponse.json({
            error: "Error al crear atributo: " + error.message
        }, { status: 500 });
    }
}

export async function GET() {
    try {
        const attributes = await prisma.attribute.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(attributes);
    } catch (error: any) {
        console.error("GET ATTRIBUTES ERROR:", error);
        return NextResponse.json({
            error: "Error al obtener atributos: " + error.message
        }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const { id, name, slug, terms, isAddon } = body;

        if (!id || !name || !slug) {
            return NextResponse.json({ error: "ID, nombre y slug requeridos" }, { status: 400 });
        }

        const attribute = await prisma.attribute.update({
            where: { id },
            data: {
                name,
                slug,
                terms: terms || "",
                isAddon: Boolean(isAddon)
            }
        });

        return NextResponse.json(attribute);
    } catch (error: any) {
        console.error("PUT ATTRIBUTE ERROR:", error);
        return NextResponse.json({
            error: "Error al actualizar atributo: " + error.message
        }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "ID de atributo requerido" }, { status: 400 });
        }

        await prisma.attribute.delete({
            where: { id }
        });

        return NextResponse.json({ message: "Atributo eliminado" });
    } catch (error: any) {
        console.error("DELETE ATTRIBUTE ERROR:", error);
        return NextResponse.json({
            error: "Error al eliminar atributo: " + error.message
        }, { status: 500 });
    }
}
