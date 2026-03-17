import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const type = searchParams.get("type"); // registered, guest, anonymous
        const minTotal = parseFloat(searchParams.get("minTotal") || "0");

        const where: any = {};

        if (type === "registered") {
            where.userId = { not: null };
        } else if (type === "guest") {
            where.userId = null;
            where.email = { not: null };
        } else if (type === "anonymous") {
            where.userId = null;
            where.email = null;
        }

        if (minTotal > 0) {
            where.total = { gte: minTotal };
        }

        const carts = await prisma.abandonedCart.findMany({
            where,
            include: {
                user: {
                    select: {
                        name: true,
                        lastName: true,
                        email: true,
                    }
                }
            },
            orderBy: {
                lastActive: "desc",
            },
        });

        return NextResponse.json(carts);
    } catch (error) {
        console.error("Error fetching abandoned carts:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (id) {
            await prisma.abandonedCart.delete({ where: { id } });
        } else {
            // Clean up old carts (older than 30 days)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            await prisma.abandonedCart.deleteMany({
                where: {
                    lastActive: { lt: thirtyDaysAgo }
                }
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
