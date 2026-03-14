import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { code } = body;

        if (!code) {
            return NextResponse.json({ error: "Missing coupon code" }, { status: 400 });
        }

        const coupon = await prisma.coupon.findUnique({
            where: { code: code.trim().toUpperCase() }
        });

        if (!coupon) {
            return NextResponse.json({ error: "Cupón no encontrado" }, { status: 404 });
        }

        if (!coupon.isActive) {
            return NextResponse.json({ error: "Este cupón ya no está activo" }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            coupon: {
                code: coupon.code,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue
            }
        });

    } catch (error) {
        console.error("Error validating coupon:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
