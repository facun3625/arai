import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resend, EMAIL_FROM } from '@/lib/mail';
import { OrderTemplate } from '@/components/emails/OrderTemplate';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log('Incoming order data:', JSON.stringify(body, null, 2));

        const {
            userId,
            items,
            subtotal,
            shippingCost,
            total,
            discount,
            paymentMethod,
            paymentProof,
            shippingAddress,
            contactInfo,
            couponCode
        } = body;

        if (!items || items.length === 0 || !contactInfo || !shippingAddress) {
            return NextResponse.json({ error: 'Datos de pedido incompletos' }, { status: 400 });
        }

        const order = await prisma.$transaction(async (tx) => {
            // Verify if user exists if userId is provided
            let validUserId = null;
            if (userId && userId.trim() !== "") {
                const userExists = await tx.user.findUnique({
                    where: { id: userId }
                });
                if (userExists) {
                    validUserId = userId;
                }
            }

            // Validate and lock stock for each item
            for (const item of items) {
                const productId = item.productId || item.id;
                const product = await tx.product.findUnique({ where: { id: productId } });
                if (!product) {
                    throw new Error(`Producto no encontrado: "${item.name}"`);
                }

                if (product.type === "VARIABLE") {
                    if (!item.variantId) {
                        throw new Error(`Falta seleccionar una opción (molienda) para "${item.name}"`);
                    }
                    const variant = await tx.variant.findUnique({ where: { id: item.variantId } });
                    if (!variant || variant.productId !== product.id) {
                        throw new Error(`Opción inválida para "${item.name}"`);
                    }
                    if (variant.stock < Number(item.quantity)) {
                        throw new Error(`Sin stock suficiente para "${item.name}". Disponible: ${variant.stock}`);
                    }
                } else {
                    if (product.stock < Number(item.quantity)) {
                        throw new Error(`Sin stock suficiente para "${item.name}". Disponible: ${product.stock}`);
                    }
                }
            }

            const newOrder = await tx.order.create({
                data: {
                    userId: validUserId,
                    status: 'PENDING',
                    subtotal: Number(subtotal),
                    shippingCost: Number(shippingCost),
                    total: Number(total),
                    discount: Number(discount),
                    couponCode: couponCode || null,
                    paymentMethod,
                    paymentProof: paymentProof || null,
                    shippingAddress: JSON.stringify(shippingAddress),
                    contactEmail: contactInfo.email,
                    contactName: contactInfo.firstName,
                    contactLastName: contactInfo.lastName,
                    contactPhone: contactInfo.phone,
                    contactDni: contactInfo.dni,
                    shippingMethod: body.selectedShippingMethod || null,
                    items: {
                        create: items.map((item: any) => {
                            let displayName = item.name;
                            if (item.variant) {
                                try {
                                    const attrs = typeof item.variant === "string" ? JSON.parse(item.variant) : item.variant;
                                    const attrStr = Object.values(attrs).filter(Boolean).join(" / ");
                                    if (attrStr) displayName = `${item.name} — ${attrStr}`;
                                } catch {}
                            }
                            return {
                                productId: item.productId || item.id,
                                variantId: item.variantId || null,
                                name: displayName,
                                quantity: Number(item.quantity),
                                price: Number(item.price),
                                image: item.image,
                                addons: item.addons && typeof item.addons === 'object' ? JSON.stringify(item.addons) : "{}"
                            };
                        })
                    }
                },
                include: {
                    items: true
                }
            });

            // Decrement stock for each item
            for (const item of items) {
                const productId = item.productId || item.id;
                if (item.variantId) {
                    await tx.variant.update({
                        where: { id: item.variantId },
                        data: { stock: { decrement: Number(item.quantity) } }
                    });
                } else {
                    await tx.product.update({
                        where: { id: productId },
                        data: { stock: { decrement: Number(item.quantity) } }
                    });
                }
            }

            // Handle coupon usage tracking
            if (couponCode) {
                const coupon = await tx.coupon.findUnique({
                    where: { code: couponCode.toUpperCase() }
                });
                if (coupon) {
                    const updateData: any = { usageCount: { increment: 1 } };
                    // Deactivate redemption coupons (CANJE-) after use
                    if (coupon.code.startsWith('CANJE-')) updateData.isActive = false;
                    // Auto-deactivate if usage limit reached
                    if (coupon.usageLimit !== null && coupon.usageCount + 1 >= coupon.usageLimit) {
                        updateData.isActive = false;
                    }
                    await tx.coupon.update({
                        where: { code: couponCode.toUpperCase() },
                        data: updateData
                    });
                }
            }

            return newOrder;
        });

        // 3. Send Confirmation Email (fire-and-forget, don't block response)
        if (order.contactEmail) {
            resend.emails.send({
                from: EMAIL_FROM,
                to: order.contactEmail,
                subject: `¡Confirmación de tu pedido #${String(order.orderNumber).padStart(4, "0")}! - Araí Yerba Mate`,
                react: OrderTemplate({
                    customerName: order.contactName,
                    orderId: order.id,
                    orderNumber: order.orderNumber,
                    items: order.items,
                    total: order.total,
                    shippingAddress: JSON.parse(order.shippingAddress)
                })
            }).catch((emailError: any) => {
                console.error('Error sending order confirmation email:', emailError);
            });
        }

        return NextResponse.json({
            order,
            message: 'Pedido creado exitosamente'
        }, { status: 201 });

    } catch (error: any) {
        console.error('Create order error details:', {
            message: error.message,
            stack: error.stack,
            code: error.code, // Useful for Prisma errors
            meta: error.meta  // Prisma error meta
        });
        return NextResponse.json({
            error: 'Error interno al crear el pedido',
            details: error.message
        }, { status: 500 });
    }
}
