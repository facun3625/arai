import { MercadoPagoConfig, Payment } from 'mercadopago';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        console.log('Mercado Pago Webhook received:', JSON.stringify(body, null, 2));

        if (body.type === 'payment') {
            const paymentId = body.data.id;

            // Read access token from DB (fallback to env var)
            const settings = await prisma.storeSettings.findUnique({ where: { id: 'global' } });
            const accessToken = settings?.mercadopagoAccessToken || process.env.MERCADOPAGO_ACCESS_TOKEN || '';

            const client = new MercadoPagoConfig({ accessToken });
            const mpPayment = new Payment(client);

            const paymentData = await mpPayment.get({ id: paymentId });
            console.log('MP Payment Data:', JSON.stringify(paymentData, null, 2));

            const orderId = paymentData.external_reference || paymentData.metadata?.order_id;
            const status = paymentData.status;

            if (orderId) {
                const existingOrder = await prisma.order.findUnique({ where: { id: orderId } });

                if (status === 'approved') {
                    // Only update if not already PAID (idempotency guard)
                    if (existingOrder && existingOrder.status !== 'PAID') {
                        console.log(`Order ${orderId} marked as PAID via MP payment ${paymentId}`);
                        await prisma.order.update({
                            where: { id: orderId },
                            data: { status: 'PAID' }
                        });
                    }
                } else if (status === 'rejected' || status === 'cancelled') {
                    // Only cancel if not already PAID (don't downgrade a confirmed payment)
                    if (existingOrder && existingOrder.status !== 'PAID') {
                        console.log(`Order ${orderId} payment ${status} via MP payment ${paymentId}`);
                        await prisma.order.update({
                            where: { id: orderId },
                            data: { status: 'CANCELLED' }
                        });
                    }
                }
                // 'pending' status: order stays PENDING until approved
            }
        }

        return NextResponse.json({ received: true });

    } catch (error: any) {
        console.error('Mercado Pago Webhook Error:', error);
        return NextResponse.json({ error: error.message }, { status: 200 });
    }
}
