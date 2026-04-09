import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const AUTH_URLS = {
  sandbox: "https://homeservices.apinaranja.com/security-ms/api/security/authB/b2b/m2msPrivate",
  production: "https://services.apinaranja.com/security-ms/api/security/authB/b2b/m2msPrivate",
};

const API_URLS = {
  sandbox: "https://api-sandbox.ranty.io",
  production: "https://api.ranty.io",
};

export async function POST(req: Request) {
  try {
    const { orderId, amount, items, description, buyer } = await req.json();

    const settings = await prisma.storeSettings.findUnique({ where: { id: "global" } });

    if (!settings?.naveEnabled) {
      return NextResponse.json({ error: "Nave no está habilitado" }, { status: 403 });
    }

    const clientId = settings.naveClientId || process.env.NAVE_CLIENT_ID;
    const clientSecret = settings.naveClientSecret || process.env.NAVE_CLIENT_SECRET;
    const audience = settings.naveAudience || process.env.NAVE_AUDIENCE;
    const posId = settings.navePosId || process.env.NAVE_POS_ID;
    const mode = (settings.naveMode || process.env.NAVE_MODE || "sandbox") as "sandbox" | "production";

    if (!clientId || !clientSecret || !audience || !posId) {
      return NextResponse.json({ error: "Credenciales de Nave incompletas (falta client_id, client_secret, audience o pos_id)" }, { status: 500 });
    }

    // 1. Obtener access_token
    const tokenRes = await fetch(AUTH_URLS[mode], {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, audience }),
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      console.error("Nave auth error:", err);
      return NextResponse.json({ error: "Error al autenticar con Nave" }, { status: 500 });
    }

    const { access_token } = await tokenRes.json();

    // 2. Preparar productos para la intención de pago
    // items es array de { name, quantity, price } o usamos description genérica
    const products = items?.length
      ? items.map((item: any) => ({
          name: item.name,
          description: item.name,
          quantity: item.quantity,
          unit_price: {
            currency: "ARS",
            value: Number(item.price).toFixed(2),
          },
        }))
      : [
          {
            name: description || "Compra Araí Yerba Mate",
            description: description || "Compra Araí Yerba Mate",
            quantity: 1,
            unit_price: {
              currency: "ARS",
              value: Number(amount).toFixed(2),
            },
          },
        ];

    // 3. Crear intención de pago
    const paymentRes = await fetch(`${API_URLS[mode]}/api/payment_request/payment_link`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        external_payment_id: orderId,
        seller: { pos_id: posId },
        transactions: [
          {
            amount: {
              currency: "ARS",
              value: Number(amount).toFixed(2),
            },
            products,
          },
        ],
        ...(buyer && { buyer }),
        additional_info: {
          callback_url: `${process.env.NEXTAUTH_URL}/checkout/success?orderId=${orderId}`,
        },
        duration_time: 86400, // 24hs
      }),
    });

    if (!paymentRes.ok) {
      const err = await paymentRes.text();
      console.error("Nave payment error:", err);
      return NextResponse.json({ error: "Error al crear la intención de pago en Nave" }, { status: 500 });
    }

    const payment = await paymentRes.json();

    // checkout_url viene en top-level en el POST, y dentro de capture_data en el GET
    const checkoutUrl = payment.checkout_url || payment.capture_data?.checkout_url;

    return NextResponse.json({
      checkout_url: checkoutUrl,
      payment_id: payment.id,
      qr_data: payment.qr_data || payment.capture_data?.qr_data,
    });
  } catch (error: any) {
    console.error("Nave create-payment error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
