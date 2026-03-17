import { MercadoPagoConfig, Preference } from 'mercadopago';
import { NextResponse } from 'next/server';

const client = new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
});

export async function POST(req: Request) {
    try {
        const { orderId, items, customerEmail, subtotal, shippingCost, discount } = await req.json();

        if (!orderId || !items || !customerEmail) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const preference = new Preference(client);

        // Prepare items array
        const mpItems = items.map((item: any) => ({
            id: item.productId || item.id,
            title: item.name,
            quantity: Number(item.quantity),
            unit_price: Number(item.price),
            currency_id: 'ARS',
        }));

        // Add discount as a negative item if it exists
        if (discount > 0) {
            mpItems.push({
                id: 'discount',
                title: 'Descuento aplicado',
                quantity: 1,
                unit_price: -Number(discount),
                currency_id: 'ARS',
            });
        }

        const body = {
            items: mpItems,
            shipments: {
                cost: Number(shippingCost),
                mode: 'not_specified',
            },
            external_reference: orderId,
            back_urls: {
                success: `${process.env.NEXTAUTH_URL}/checkout/success?orderId=${orderId}`,
                failure: `${process.env.NEXTAUTH_URL}/checkout/failure?orderId=${orderId}`,
                pending: `${process.env.NEXTAUTH_URL}/checkout/pending?orderId=${orderId}`,
            },
            // MP production credentials require HTTPS for auto_return to work.
            // On localhost we disable it to avoid 400 error.
            auto_return: process.env.NEXTAUTH_URL?.includes('localhost') ? undefined : 'approved',
            // MP notification_url must be HTTPS and not localhost. 
            // In dev we might skip it or use a proxy like ngrok
            notification_url: process.env.NEXTAUTH_URL?.includes('localhost') 
                ? undefined 
                : `${process.env.NEXTAUTH_URL}/api/payments/mercadopago/webhook`,
            payer: {
                email: customerEmail,
            },
            metadata: {
                order_id: orderId,
            }
        };

        console.log('Sending MP Preference Body:', JSON.stringify(body, null, 2));

        const response = await preference.create({ body });

        // If there's a significant difference between MP sum and our total, 
        // we might want to adjust an item price slightly or add an adjustment item.
        // For now, mapping items + shipments cost should cover it.

        return NextResponse.json({ 
            id: response.id, 
            init_point: response.init_point 
        });

    } catch (error: any) {
        console.error('Error creating MP preference:', error);
        // Log the full cause if available (MP SDK often puts details here)
        if (error.cause) {
            console.error('MP Error Cause:', JSON.stringify(error.cause, null, 2));
        }
        return NextResponse.json({ 
            error: 'Error al crear la preferencia de pago',
            details: error.message 
        }, { status: 500 });
    }
}
