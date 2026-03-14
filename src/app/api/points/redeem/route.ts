import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { userId, rewardId } = body;

        if (!userId || !rewardId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // 1. Fetch user and reward
        const [user, reward] = await Promise.all([
            prisma.user.findUnique({ where: { id: userId } }),
            prisma.pointReward.findUnique({ where: { id: rewardId } })
        ]);

        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
        if (!reward) return NextResponse.json({ error: "Reward not found" }, { status: 404 });
        if (!reward.isActive) return NextResponse.json({ error: "Reward is currently inactive" }, { status: 400 });

        // 2. Validate points
        if (user.points < reward.pointsRequired) {
            return NextResponse.json({ error: "Insufficient points" }, { status: 400 });
        }

        // 3. Generate a unique coupon code
        const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
        const couponCode = `CANJE-${randomString}`;

        // 4. Perform transaction
        const result = await prisma.$transaction(async (tx) => {
            // Deduct points
            await tx.user.update({
                where: { id: userId },
                data: { points: { decrement: reward.pointsRequired } }
            });

            // Record point transaction
            await tx.pointTransaction.create({
                data: {
                    userId,
                    amount: -reward.pointsRequired,
                    description: `Canje por: ${reward.title}`
                }
            });

            // Create coupon
            const coupon = await tx.coupon.create({
                data: {
                    code: couponCode,
                    discountType: reward.discountType,
                    discountValue: reward.discountValue,
                    isActive: true,
                    userId: userId,
                    // One-time use logic is handled when order is placed
                }
            });

            return coupon;
        });

        return NextResponse.json({
            success: true,
            coupon: result,
            message: `¡Canje exitoso! Tu cupón es: ${couponCode}`
        });

    } catch (error) {
        console.error("Error in redemption process:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
