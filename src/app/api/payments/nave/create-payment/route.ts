import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const AUTH_URLS = {
  sandbox: "https://homoservices.apinaranja.com/security-ms/api/security/auth0/b2b/m2msPrivate",
  production: "https://services.apinaranja.com/security-ms/api/security/auth0/b2b/m2msPrivate",
};

const API_URLS = {
  sandbox: "https://api-sandbox.ranty.io",
  production: "https://api.ranty.io",
};

const AUDIENCE = "https://naranja.com/ranty/merchants/api";

export async function POST(req: Request) {
  try {
    const { orderId, amount, items, description, buyer } = await req.json();

    const settings = await prisma.storeSettings.findUnique({ where: { id: "global" } });

    if (!settings?.naveEnabled) {
      return NextResponse.json({ error: "Nave no está habilitado" }, { status: 403 });
    }

    const clientId = settings.naveClientId || process.env.NAVE_CLIENT_ID;
    const clientSecret = settings.naveClientSecret || process.env.NAVE_CLIENT_SECRET;
    const posId = settings.navePosId || process.env.NAVE_POS_ID;
    const mode = (settings.naveMode || process.env.NAVE_MODE || "sandbox") as "sandbox" | "production";

    if (!clientId || !clientSecret || !posId) {
      return NextResponse.json({ error: "Credenciales de Nave incompletas (falta client_id, client_secret o pos_id)" }, { status: 500 });
    }

    // 1. Obtener access_token
    const tokenRes = await fetch(AUTH_URLS[mode], {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, audience: AUDIENCE }),
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      console.error("Nave auth error:", err);
      return NextResponse.json({ error: "Error al autenticar con Nave" }, { status: 500 });
    }

    const { access_token } = await tokenRes.json();

    // 2. Preparar productos
    const products = items?.length
      ? items.map((item: any) => ({
          name: item.name,
          description: item.name,
          quantity: Number(item.quantity),
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
    const paymentRes = await fetch(`${API_URLS[mode]}/api/payment_request/ecommerce`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        external_payment_id: String(orderId).substring(0, 36),
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
        duration_time: 86400,
      }),
    });

    if (!paymentRes.ok) {
      const err = await paymentRes.text();
      console.error("Nave payment error:", err);
      return NextResponse.json({ error: "Error al crear la intención de pago en Nave" }, { status: 500 });
    }

    const payment = await paymentRes.json();

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
