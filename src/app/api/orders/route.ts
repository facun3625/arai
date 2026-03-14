import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
            contactInfo
        } = body;

        if (!items || items.length === 0 || !contactInfo || !shippingAddress) {
            return NextResponse.json({ error: 'Datos de pedido incompletos' }, { status: 400 });
        }

        const order = await prisma.order.create({
            data: {
                userId,
                status: 'PENDING',
                subtotal: Number(subtotal),
                shippingCost: Number(shippingCost),
                total: Number(total),
                discount: Number(discount),
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
