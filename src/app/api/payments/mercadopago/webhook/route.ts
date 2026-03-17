import { MercadoPagoConfig, Payment } from 'mercadopago';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const client = new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        console.log('Mercado Pago Webhook received:', JSON.stringify(body, null, 2));

        // MP webhooks send 'type' and 'data.id'
        if (body.type === 'payment') {
            const paymentId = body.data.id;
            const mpPayment = new Payment(client);
            
            const paymentData = await mpPayment.get({ id: paymentId });
            console.log('MP Payment Data:', JSON.stringify(paymentData, null, 2));

            const orderId = paymentData.external_reference || paymentData.metadata?.order_id;
            const status = paymentData.status;

            if (orderId && status === 'approved') {
                console.log(`Order ${orderId} marked as PAID via Mercado Pago payment ${paymentId}`);
                
                await prisma.order.update({
                    where: { id: orderId },
                    data: {
                        status: 'PAID',
                        // We could also store the payment ID in a new field if needed
                    }
                });
                
                // Note: We might want to trigger shipping label generation here in the future
            }
        }

        return NextResponse.json({ received: true });

    } catch (error: any) {
        console.error('Mercado Pago Webhook Error:', error);
        // We return 200 even on error to stop MP from retrying infinitely if it's a logic error
        return NextResponse.json({ error: error.message }, { status: 200 });
    }
}
