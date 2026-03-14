import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const rewards = await prisma.pointReward.findMany({
            orderBy: { pointsRequired: 'asc' }
        });
        return NextResponse.json(rewards);
    } catch (error) {
        console.error("Error fetching rewards:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { id, title, pointsRequired, discountValue, discountType, isActive, adminId } = body;

        if (!adminId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const admin = await prisma.user.findUnique({ where: { id: adminId } });
        if (!admin || admin.role !== 'ADMIN') {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const rewardData = {
            title,
            pointsRequired: Number(pointsRequired),
            discountValue: Number(discountValue),
            discountType,
            isActive: isActive ?? true
        };

        if (id) {
            const updated = await prisma.pointReward.update({
                where: { id },
                data: rewardData
            });
            return NextResponse.json(updated);
        } else {
            const created = await prisma.pointReward.create({
                data: rewardData
            });
            return NextResponse.json(created);
        }
    } catch (error) {
        console.error("Error saving reward:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        const adminId = searchParams.get("adminId");

        if (!adminId || !id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const admin = await prisma.user.findUnique({ where: { id: adminId } });
        if (!admin || admin.role !== 'ADMIN') {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        await prisma.pointReward.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting reward:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
