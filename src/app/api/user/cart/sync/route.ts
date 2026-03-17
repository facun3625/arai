import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { sessionId, userId, email, phone, name, items, total } = body;

        if (!sessionId && !userId) {
            return NextResponse.json({ error: "Missing identity" }, { status: 400 });
        }

        // Verify if user exists if userId is provided
        let validUserId = null;
        if (userId && userId.trim() !== "") {
            const userExists = await prisma.user.findUnique({
                where: { id: userId }
            });
            if (userExists) {
                validUserId = userId;
            }
        }

        const cartData = {
            userId: validUserId,
            email: email || null,
            phone: phone || null,
            name: name || null,
            items: JSON.stringify(items),
            total: total || 0,
            lastActive: new Date(),
        };

        const abandonedCart = await prisma.abandonedCart.upsert({
            where: { sessionId: sessionId || "no-session" },
            update: cartData,
            create: {
                ...cartData,
                sessionId: sessionId || null,
            },
        });

        return NextResponse.json(abandonedCart);
    } catch (error) {
        console.error("Error syncing abandoned cart:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
