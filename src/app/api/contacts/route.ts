import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const { name, phone } = await req.json();

        if (!name?.trim() || !phone?.trim()) {
            return NextResponse.json({ error: "Nombre y teléfono requeridos" }, { status: 400 });
        }

        const contact = await prisma.contact.create({
            data: {
                name: name.trim(),
                phone: phone.trim(),
                source: "chat",
                status: "PENDING",
            },
        });

        return NextResponse.json({ success: true, contact }, { status: 201 });
    } catch (error: any) {
        console.error("Error creating contact:", error);
        return NextResponse.json({ error: "Error al guardar contacto" }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const adminId = searchParams.get("adminId");

        if (!adminId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const admin = await prisma.user.findUnique({ where: { id: adminId } });
        if (!admin || admin.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const contacts = await prisma.contact.findMany({
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({ contacts });
    } catch (error: any) {
        console.error("Error fetching contacts:", error);
        return NextResponse.json({ error: "Error al obtener contactos" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const { id, status, notes, adminId } = await req.json();

        if (!adminId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const admin = await prisma.user.findUnique({ where: { id: adminId } });
        if (!admin || admin.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const contact = await prisma.contact.update({
            where: { id },
            data: {
                ...(status && { status }),
                ...(notes !== undefined && { notes }),
            },
        });

        return NextResponse.json({ success: true, contact });
    } catch (error: any) {
        console.error("Error updating contact:", error);
        return NextResponse.json({ error: "Error al actualizar contacto" }, { status: 500 });
    }
}
