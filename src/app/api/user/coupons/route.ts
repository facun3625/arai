import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const userId = url.searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: "No user ID provided" }, { status: 400 });
        }

        const coupons = await prisma.coupon.findMany({
            where: {
                userId: userId,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json({ coupons });
    } catch (error) {
        console.error("Error fetching user coupons:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
