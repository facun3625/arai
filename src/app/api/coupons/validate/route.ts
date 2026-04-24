import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { code, userId, email } = body;

        if (!code) return NextResponse.json({ error: "Missing coupon code" }, { status: 400 });

        const coupon = await prisma.coupon.findUnique({
            where: { code: code.trim().toUpperCase() }
        });

        if (!coupon) return NextResponse.json({ error: "Cupón no encontrado" }, { status: 404 });
        if (!coupon.isActive) return NextResponse.json({ error: "Este cupón ya no está activo" }, { status: 400 });

        // Check expiration
        if (coupon.expiresAt && new Date() > coupon.expiresAt) {
            return NextResponse.json({ error: "Este cupón ha expirado" }, { status: 400 });
        }

        // Check total usage limit
        if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
            return NextResponse.json({ error: "Este cupón ya alcanzó su límite de usos" }, { status: 400 });
        }

        // Check per-user usage limit
        if (coupon.usageLimitPerUser !== null && (userId || email)) {
            const whereClause: any = { couponCode: coupon.code };
            if (userId) whereClause.userId = userId;
            else if (email) whereClause.contactEmail = email;

            const userUsageCount = await prisma.order.count({ where: whereClause });
            if (userUsageCount >= coupon.usageLimitPerUser) {
                return NextResponse.json({ error: "Ya usaste este cupón el máximo de veces permitido" }, { status: 400 });
            }
        }

        return NextResponse.json({
            success: true,
            coupon: {
                code: coupon.code,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue,
                minPurchaseAmount: coupon.minPurchaseAmount,
            }
        });

    } catch (error) {
        console.error("Error validating coupon:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
