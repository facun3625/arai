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
                    items: {
                        create: items.map((item: any) => ({
                            productId: item.productId || item.id,
                            variantId: item.variantId || null,
                            name: item.name,
                            quantity: Number(item.quantity),
                            price: Number(item.price),
                            image: item.image
                        }))
                    }
                },
                include: {
                    items: true
                }
            });

            // If a redemption coupon was used, deactivate it (if it exists)
            if (couponCode && couponCode.toUpperCase().startsWith('CANJE-')) {
                const coupon = await tx.coupon.findUnique({
                    where: { code: couponCode.toUpperCase() }
                });

                if (coupon) {
                    await tx.coupon.update({
                        where: { code: couponCode.toUpperCase() },
                        data: { isActive: false }
                    });
                }
            }

            return newOrder;
        });

        // 3. Send Confirmation Email (Async, don't block response)
        try {
            if (order.contactEmail) {
                await resend.emails.send({
                    from: EMAIL_FROM,
                    to: order.contactEmail,
                    subject: `¡Confirmación de tu pedido #${order.id.slice(-6).toUpperCase()}! - Araí Yerba Mate`,
                    react: OrderTemplate({
                        customerName: order.contactName,
                        orderId: order.id,
                        items: order.items,
                        total: order.total,
                        shippingAddress: JSON.parse(order.shippingAddress)
                    })
                });
            }
        } catch (emailError) {
            console.error('Error sending order confirmation email:', emailError);
            // We don't throw here as the order was already created successfully
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
