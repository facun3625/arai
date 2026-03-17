import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const adminId = searchParams.get("adminId");

        // 1. Basic Admin Auth
        if (!adminId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const admin = await prisma.user.findUnique({
            where: { id: adminId }
        });

        if (!admin || admin.role !== 'ADMIN') {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // 2. Calculate Stats

        // ALL: Subscribers + Users (Unique Emails)
        const subscribersEmails = await prisma.subscriber.findMany({
            where: { isActive: true },
            select: { email: true }
        });
        const usersEmails = await prisma.user.findMany({
            select: { email: true }
        });
        const allUniqueEmails = new Set([
            ...subscribersEmails.map(s => s.email.toLowerCase()),
            ...usersEmails.map(u => u.email.toLowerCase())
        ]);

        // ABANDONED_CART: Emails in AbandonedCart
        const abandonedEmails = await prisma.abandonedCart.findMany({
            where: { email: { not: null } },
            select: { email: true }
        });
        const abandonedUniqueEmails = new Set(
            abandonedEmails.map(a => a.email!.toLowerCase())
        );

        // CUSTOMERS: Users with at least one order (not cancelled)
        const customerCount = await prisma.user.count({
            where: {
                orders: {
                    some: {
                        status: { not: "CANCELLED" }
                    }
                }
            }
        });

        // REGISTERED: Total Users
        const registeredCount = await prisma.user.count();

        return NextResponse.json({
            stats: {
                ALL: allUniqueEmails.size,
                ABANDONED_CART: abandonedUniqueEmails.size,
                CUSTOMERS: customerCount,
                REGISTERED: registeredCount
            }
        });

    } catch (error) {
        console.error("DEBUG: Failed to fetch audience stats", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
