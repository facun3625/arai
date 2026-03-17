import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resend, EMAIL_FROM } from "@/lib/mail";
import { StatusUpdateTemplate } from "@/components/emails/StatusUpdateTemplate";

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

        // Parse shippingAddress from JSON string to object
        const parsedOrders = orders.map(order => ({
            ...order,
            shippingAddress: typeof order.shippingAddress === 'string'
                ? JSON.parse(order.shippingAddress)
                : order.shippingAddress
        }));

        return NextResponse.json({ orders: parsedOrders });
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

        // 3. Send Status Notification Email
        try {
            const orderWithContact = await prisma.order.findUnique({
                where: { id: orderId }
            });

            if (orderWithContact && orderWithContact.contactEmail) {
                let emailSubject = "";
                let emailMessage = "";
                let friendlyStatus = "";

                if (status === "PAID") {
                    emailSubject = "¡Recibimos tu pago! - Araí Yerba Mate";
                    emailMessage = "Hemos verificado tu comprobante de pago con éxito. Ahora estamos preparando todo para que disfrutes de tu Yerba Araí.";
                    friendlyStatus = "PAGO CONFIRMADO";
                } else if (status === "COMPLETED" || status === "SHIPPED") {
                    emailSubject = "¡Tu pedido está en camino! - Araí Yerba Mate";
                    emailMessage = "Estamos muy contentos de avisarte que tu pedido ha sido despachado. ¡Pronto llegará a tus manos!";
                    friendlyStatus = "EN CAMINO / COMPLETADO";
                }

                if (emailSubject) {
                    await resend.emails.send({
                        from: EMAIL_FROM,
                        to: orderWithContact.contactEmail,
                        subject: emailSubject,
                        react: StatusUpdateTemplate({
                            customerName: orderWithContact.contactName,
                            orderId: orderWithContact.id,
                            newStatus: friendlyStatus,
                            message: emailMessage
                        })
                    });
                }
            }
        } catch (emailError) {
            console.error("DEBUG: Failed to send status update email", emailError);
        }

        return NextResponse.json({ order: updatedOrder });
    } catch (error) {
        console.error("DEBUG: Failed to update order status", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const orderId = searchParams.get("id");
        const adminId = searchParams.get("adminId");

        if (!adminId || !orderId) {
            return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
        }

        const admin = await prisma.user.findUnique({
            where: { id: adminId }
        });

        if (!admin || admin.role !== 'ADMIN') {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // 1. Eliminar transacciones de puntos asociadas (Prisma cascade no lo hace si no está definido)
        // Aunque definimos onDelete: Cascade en el esquema para pointTransaction -> user, 
        // para orderId es opcional y no tiene cascade explícito en la relación inversa.
        await prisma.pointTransaction.deleteMany({
            where: { orderId: orderId }
        });

        // 2. Eliminar el pedido (OrderItem fallará por cascade definido en el schema)
        await prisma.order.delete({
            where: { id: orderId }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DEBUG: Failed to delete order", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
