import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const adminId = searchParams.get("adminId");

        if (!adminId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const admin = await prisma.user.findUnique({
            where: { id: adminId }
        });

        if (!admin || admin.role !== 'ADMIN') {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const campaigns = await prisma.sentCampaign.findMany({
            orderBy: { createdAt: 'desc' },
            take: 50
        });

        return NextResponse.json({ campaigns });
    } catch (error: any) {
        console.error("DEBUG: Failed to fetch sent campaigns", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
