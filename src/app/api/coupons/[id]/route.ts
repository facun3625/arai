import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
        await prisma.coupon.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting coupon:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        const data: any = {};
        if (body.isActive !== undefined) data.isActive = body.isActive;
        if (body.expiresAt !== undefined) data.expiresAt = body.expiresAt ? new Date(body.expiresAt) : null;
        if (body.usageLimit !== undefined) data.usageLimit = body.usageLimit ? Number(body.usageLimit) : null;
        if (body.usageLimitPerUser !== undefined) data.usageLimitPerUser = body.usageLimitPerUser ? Number(body.usageLimitPerUser) : null;

        const coupon = await prisma.coupon.update({ where: { id }, data });
        return NextResponse.json(coupon);
    } catch (error) {
        console.error("Error updating coupon:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
