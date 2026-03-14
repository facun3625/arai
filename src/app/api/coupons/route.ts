import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
    try {
        const coupons = await prisma.coupon.findMany({
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
        const { code, discountType, discountValue, minPurchaseAmount, isActive } = body;

        // Basic validation
        if (!code || !discountType || discountValue === undefined) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Check if code already exists
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
                isActive: isActive ?? true
            }
        });

        return NextResponse.json(coupon);
    } catch (error) {
        console.error("Error creating coupon:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
