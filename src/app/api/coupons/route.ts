import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const coupons = await prisma.coupon.findMany({
            include: { user: { select: { name: true, email: true } } },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(coupons);
    } catch (error) {
        console.error("Error fetching coupons:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { code, discountType, discountValue, minPurchaseAmount, isActive, expiresAt, usageLimit, usageLimitPerUser } = body;

        if (!code || !discountType || discountValue === undefined) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const existing = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
        if (existing) {
            return NextResponse.json({ error: "El cupón ya existe" }, { status: 400 });
        }

        const coupon = await prisma.coupon.create({
            data: {
                code: code.toUpperCase(),
                discountType,
                discountValue: Number(discountValue),
                minPurchaseAmount: minPurchaseAmount ? Number(minPurchaseAmount) : null,
                isActive: isActive ?? true,
                expiresAt: expiresAt ? new Date(expiresAt) : null,
                usageLimit: usageLimit ? Number(usageLimit) : null,
                usageLimitPerUser: usageLimitPerUser ? Number(usageLimitPerUser) : null,
            }
        });

        return NextResponse.json(coupon);
    } catch (error) {
        console.error("Error creating coupon:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
