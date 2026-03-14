import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const queryUserId = searchParams.get("userId");

        const session = await getServerSession(authOptions);
        const userEmail = session?.user?.email;

        let user;
        if (userEmail) {
            user = await prisma.user.findUnique({
                where: { email: userEmail },
                select: {
                    id: true,
                    points: true,
                    pointTransactions: {
                        orderBy: { createdAt: 'desc' },
                        take: 10
                    }
                }
            });
        } else if (queryUserId) {
            user = await prisma.user.findUnique({
                where: { id: queryUserId },
                select: {
                    id: true,
                    points: true,
                    pointTransactions: {
                        orderBy: { createdAt: 'desc' },
                        take: 10
                    }
                }
            });
        }

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const rewards = await prisma.pointReward.findMany({
            where: { isActive: true },
            orderBy: { pointsRequired: 'asc' }
        });

        const settings = await prisma.storeSettings.findFirst();

        return NextResponse.json({
            points: user?.points || 0,
            transactions: user?.pointTransactions || [],
            rewards: rewards || [],
            pointsEnabled: settings?.pointsEnabled || false
        });
    } catch (error) {
        console.error("Error fetching user points:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
