import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function getReviewEligibility(userId: string, productId: string, db: Prisma.TransactionClient = prisma) {
    const existing = await db.review.findFirst({ where: { productId, userId }, select: { id: true } });
    if (existing) return { canReview: false, reason: "ALREADY_REVIEWED" as const };
    const purchase = await db.order.findFirst({
        where: {
            userId,
            status: { in: ["PAID", "PROCESSING", "SHIPPED", "COMPLETED"] },
            items: { some: { productId } },
        },
        select: { id: true },
    });
    return purchase
        ? { canReview: true, reason: "ELIGIBLE" as const }
        : { canReview: false, reason: "PURCHASE_REQUIRED" as const };
}
