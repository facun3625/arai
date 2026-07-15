import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeCategoryPromoDiscount } from "@/lib/categoryPromotions";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const items = Array.isArray(body.items) ? body.items : [];

        const result = await computeCategoryPromoDiscount(
            prisma,
            items.map((i: any) => ({
                productId: i.productId || i.id,
                variantId: i.variantId || null,
                quantity: i.quantity
            }))
        );

        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json({ discount: 0, details: [] });
    }
}
