import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const adminId = searchParams.get("adminId");

        if (!adminId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const admin = await prisma.user.findUnique({
            where: { id: adminId }
        });

        if (!admin || admin.role !== 'ADMIN') {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const orders = await prisma.order.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        name: true,
                        lastName: true,
                        email: true
                    }
                },
                items: true
            }
        });

        return NextResponse.json({ orders });
    } catch (error) {
        console.error("DEBUG: Failed to fetch admin orders", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const body = await req.json();
        const { orderId, status, adminId } = body;

        if (!adminId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const admin = await prisma.user.findUnique({
            where: { id: adminId }
        });

        if (!admin || admin.role !== 'ADMIN') {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: { status }
        });

        // Lógica de Puntos
        if ((status === "PAID" || status === "COMPLETED") && updatedOrder.userId) {
            try {
                // Verificar si ya se otorgaron puntos para este pedido
                const existingTransaction = await prisma.pointTransaction.findFirst({
                    where: { orderId: orderId, amount: { gt: 0 } }
                });

                if (!existingTransaction) {
                    const settings = await prisma.storeSettings.findUnique({ where: { id: "global" } });

                    if (settings?.pointsEnabled && settings.pointsRatio > 0) {
                        const pointsToAward = Math.floor(updatedOrder.subtotal * settings.pointsRatio);

                        if (pointsToAward > 0) {
                            await prisma.$transaction([
                                prisma.user.update({
                                    where: { id: updatedOrder.userId },
                                    data: { points: { increment: pointsToAward } }
                                }),
                                prisma.pointTransaction.create({
                                    data: {
                                        userId: updatedOrder.userId,
                                        orderId: orderId,
                                        amount: pointsToAward,
                                        description: `Puntos ganados por pedido #${orderId.slice(-6)}`
                                    }
                                })
                            ]);
                        }
                    }
                }
            } catch (error) {
                console.error("DEBUG: Failed to award points", error);
                // No fallamos la actualización del pedido por un error en puntos
            }
        }

        return NextResponse.json({ order: updatedOrder });
    } catch (error) {
        console.error("DEBUG: Failed to update order status", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
