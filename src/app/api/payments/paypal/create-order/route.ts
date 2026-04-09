import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const PAYPAL_URLS = {
  sandbox: "https://api-m.sandbox.paypal.com",
  production: "https://api-m.paypal.com",
};

export async function POST(req: Request) {
  try {
    const { orderId, amount } = await req.json();

    const settings = await prisma.storeSettings.findUnique({ where: { id: "global" } });

    if (!settings?.paypalEnabled) {
      return NextResponse.json({ error: "PayPal no está habilitado" }, { status: 403 });
    }

    const clientId = settings.paypalClientId || process.env.PAYPAL_CLIENT_ID;
    const secret = settings.paypalSecret || process.env.PAYPAL_SECRET;
    const mode = (settings.paypalMode || "sandbox") as "sandbox" | "production";
    const baseUrl = PAYPAL_URLS[mode];

    if (!clientId || !secret) {
      return NextResponse.json({ error: "Credenciales de PayPal no configuradas" }, { status: 500 });
    }

    // 1. Obtener access token
    const tokenRes = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${clientId}:${secret}`).toString("base64")}`,
      },
      body: "grant_type=client_credentials",
    });

    if (!tokenRes.ok) {
      console.error("PayPal token error:", await tokenRes.text());
      return NextResponse.json({ error: "Error al autenticar con PayPal" }, { status: 500 });
    }

    const { access_token } = await tokenRes.json();

    // 2. Crear orden
    const orderRes = await fetch(`${baseUrl}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            reference_id: orderId,
            amount: {
              currency_code: "USD",
              value: Number(amount).toFixed(2),
            },
          },
        ],
        application_context: {
          return_url: `${process.env.NEXTAUTH_URL}/api/payments/paypal/capture?orderId=${orderId}`,
          cancel_url: `${process.env.NEXTAUTH_URL}/checkout`,
          brand_name: "Araí Yerba Mate",
          user_action: "PAY_NOW",
        },
      }),
    });

    if (!orderRes.ok) {
      console.error("PayPal order error:", await orderRes.text());
      return NextResponse.json({ error: "Error al crear la orden en PayPal" }, { status: 500 });
    }

    const order = await orderRes.json();
    const approvalUrl = order.links?.find((l: any) => l.rel === "approve")?.href;

    return NextResponse.json({ approval_url: approvalUrl, paypal_order_id: order.id });
  } catch (error: any) {
    console.error("PayPal create-order error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
