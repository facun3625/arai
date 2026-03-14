import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, slug, description, image } = body;

        if (!name || !slug) {
            return NextResponse.json({ error: "Nombre y slug requeridos" }, { status: 400 });
        }

        const category = await prisma.category.create({
            data: { name, slug, description, image }
        });

        return NextResponse.json(category);
    } catch (error: any) {
        console.error("PRISMA ERROR:", error);
        return NextResponse.json({
            error: "Error de Prisma: " + error.message
        }, { status: 500 });
    }
}

export async function GET() {
    try {
        const categories = await prisma.category.findMany({
            include: { _count: { select: { products: true } } },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(categories);
    } catch (error: any) {
        console.error("GET CATEGORIES ERROR:", error);
        return NextResponse.json({
            error: "Error de Prisma: " + error.message
        }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const { id, name, slug, description, image } = body;

        if (!id || !name || !slug) {
            return NextResponse.json({ error: "ID, nombre y slug requeridos" }, { status: 400 });
        }

        const category = await prisma.category.update({
            where: { id },
            data: { name, slug, description, image }
        });

        return NextResponse.json(category);
    } catch (error: any) {
        console.error("PUT CATEGORY ERROR:", error);
        return NextResponse.json({
            error: "Error al actualizar categoría: " + error.message
        }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "ID de categoría requerido" }, { status: 400 });
        }

        const category = await prisma.category.findUnique({
            where: { id }
        });

        if (!category) {
            return NextResponse.json({ error: "Categoría no encontrada" }, { status: 404 });
        }

        if (category.slug === "sin-categoria") {
            return NextResponse.json({ error: "No se puede eliminar la categoría por defecto" }, { status: 400 });
        }

        await prisma.category.delete({
            where: { id }
        });

        return NextResponse.json({ message: "Categoría eliminada" });
    } catch (error: any) {
        console.error("DELETE CATEGORY ERROR:", error);
        return NextResponse.json({
            error: "Error al eliminar categoría: " + error.message
        }, { status: 500 });
    }
}
