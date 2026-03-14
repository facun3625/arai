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

        const pendingCount = await prisma.order.count({
            where: {
                status: {
                    in: ['Pending', 'PENDING', 'pending']
                }
            }
        });

        const processingCount = await prisma.order.count({
            where: {
                status: {
                    in: ['Processing', 'PROCESSING', 'processing']
                }
            }
        });

        return NextResponse.json({
            Pending: pendingCount,
            Processing: processingCount
        });
    } catch (error) {
        console.error("DEBUG: Failed to fetch order stats", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
