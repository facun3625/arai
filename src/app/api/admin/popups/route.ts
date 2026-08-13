import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Auth check helper
async function isAdmin(adminId: string) {
    if (!adminId) return false;
    const user = await prisma.user.findUnique({
        where: { id: adminId }
    });
    return user?.role === "ADMIN";
}

export async function GET(req: NextRequest) {
    try {
        const popups = await prisma.popup.findMany();
        return NextResponse.json(popups);
    } catch (error: any) {
        console.error("CRITICAL: Error fetching popups:", error);
        return NextResponse.json({
            error: "Error fetching popups",
            details: error?.message || "Unknown error"
        }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        console.log("DEBUG: Saving popup request body:", body);
        const { adminId, location, isActive, imageUrl, displayFrequency, title, description } = body;
        const type = body.type === "NEWSLETTER" ? "NEWSLETTER" : "IMAGE";

        if (!adminId) {
            return NextResponse.json({ error: "Missing adminId" }, { status: 401 });
        }

        const admin = await prisma.user.findUnique({
            where: { id: adminId }
        });

        if (!admin || admin.role !== 'ADMIN') {
            console.warn("DEBUG: Unauthorized popup save attempt by user:", adminId);
            return NextResponse.json({ error: "Forbidden: Admin role required" }, { status: 403 });
        }

        if (!location) {
            return NextResponse.json({ error: "Missing required field (location)" }, { status: 400 });
        }

        // An image popup needs an image; a newsletter popup doesn't.
        if (type === "IMAGE" && !imageUrl) {
            return NextResponse.json({ error: "Falta la imagen del pop-up" }, { status: 400 });
        }

        const data = {
            isActive: Boolean(isActive),
            type,
            imageUrl: imageUrl || "",
            title: title || null,
            description: description || null,
            displayFrequency: displayFrequency || "SESSION",
        };

        const popup = await prisma.popup.upsert({
            where: { location },
            update: { ...data, updatedAt: new Date() },
            create: { location, ...data }
        });

        return NextResponse.json(popup);
    } catch (error: any) {
        console.error("CRITICAL: Error saving popup:", error);
        return NextResponse.json({
            error: "Internal Server Error",
            details: error?.message || "Unknown error"
        }, { status: 500 });
    }
}
