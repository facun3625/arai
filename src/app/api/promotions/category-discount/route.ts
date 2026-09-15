import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeCategoryPromoDiscount, computeCategoryPercentDiscount } from "@/lib/categoryPromotions";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const items = Array.isArray(body.items) ? body.items : [];
        const mappedItems = items.map((i: any) => ({
            productId: i.productId || i.id,
            variantId: i.variantId || null,
            quantity: i.quantity
        }));

        const [twoForOne, percent] = await Promise.all([
            computeCategoryPromoDiscount(prisma, mappedItems),
            computeCategoryPercentDiscount(prisma, mappedItems)
        ]);

        return NextResponse.json({
            discount: twoForOne.discount + percent.discount,
            details: [...twoForOne.details, ...percent.details]
        });
    } catch (error) {
        return NextResponse.json({ discount: 0, details: [] });
    }
}
