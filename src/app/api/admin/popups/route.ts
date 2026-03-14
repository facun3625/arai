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
        const { adminId, location, isActive, imageUrl, displayFrequency } = body;

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

        if (!location || !imageUrl) {
            return NextResponse.json({ error: "Missing required fields (location or imageUrl)" }, { status: 400 });
        }

        const popup = await prisma.popup.upsert({
            where: { location },
            update: {
                isActive: Boolean(isActive),
                imageUrl,
                displayFrequency: displayFrequency || "SESSION",
                updatedAt: new Date()
            },
            create: {
                location,
                isActive: Boolean(isActive),
                imageUrl,
                displayFrequency: displayFrequency || "SESSION"
            }
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
