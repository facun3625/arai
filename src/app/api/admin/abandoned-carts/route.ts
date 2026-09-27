import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resend, EMAIL_FROM } from "@/lib/mail";
import { AbandonedCartTemplate } from "@/components/emails/AbandonedCartTemplate";

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

export async function POST(req: Request) {
    try {
        const { id, adminId } = await req.json();

        if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const admin = await prisma.user.findUnique({ where: { id: adminId } });
        if (!admin || admin.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        if (!id) return NextResponse.json({ error: "id requerido" }, { status: 400 });

        const cart = await prisma.abandonedCart.findUnique({
            where: { id },
            include: { user: { select: { name: true, lastName: true, email: true } } },
        });
        if (!cart) return NextResponse.json({ error: "Carrito no encontrado" }, { status: 404 });

        const email = cart.email || cart.user?.email;
        if (!email) return NextResponse.json({ error: "Este carrito no tiene un email asociado" }, { status: 400 });

        let items: { name: string; quantity: number }[] = [];
        try {
            items = JSON.parse(cart.items || "[]");
        } catch {
            items = [];
        }

        const customerName = cart.user
            ? `${cart.user.name || ""} ${cart.user.lastName || ""}`.trim()
            : (cart.name || "");

        await resend.emails.send({
            from: EMAIL_FROM,
            to: email,
            subject: "Dejaste productos en tu carrito - Araí Yerba Mate",
            react: AbandonedCartTemplate({
                customerName: customerName || "cliente",
                items,
                total: cart.total,
            }),
        });

        const updated = await prisma.abandonedCart.update({
            where: { id },
            data: { remindedAt: new Date() },
        });

        return NextResponse.json({ success: true, cart: updated });
    } catch (error: any) {
        console.error("Error sending abandoned cart reminder:", error);
        return NextResponse.json({ error: "Error al enviar el recordatorio" }, { status: 500 });
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
