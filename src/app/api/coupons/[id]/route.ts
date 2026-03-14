import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

        await prisma.coupon.delete({
            where: { id }
        });

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

        const coupon = await prisma.coupon.update({
            where: { id },
            data: {
                isActive: body.isActive
            }
        });

        return NextResponse.json(coupon);
    } catch (error) {
        console.error("Error updating coupon:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
