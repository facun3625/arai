import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Nave envía: { payment_id, payment_check_url, external_payment_id }
// Hay que responder HTTP 200, y opcionalmente hacer GET a payment_check_url para verificar estado.

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Nave Webhook received:", JSON.stringify(body, null, 2));

    const orderId = body.external_payment_id;
    const paymentCheckUrl = body.payment_check_url;

    if (!orderId) {
      return NextResponse.json({ received: true });
    }

    // Consultar el estado real del pago usando payment_check_url
    let statusName: string | null = null;

    if (paymentCheckUrl) {
      try {
        // Para consultar necesitamos un token — lo obtenemos frescos
        const settings = await prisma.storeSettings.findUnique({ where: { id: "global" } });
        const clientId = settings?.naveClientId || process.env.NAVE_CLIENT_ID;
        const clientSecret = settings?.naveClientSecret || process.env.NAVE_CLIENT_SECRET;
        const audience = settings?.naveAudience || process.env.NAVE_AUDIENCE;
        const mode = (settings?.naveMode || process.env.NAVE_MODE || "sandbox") as string;

        const AUTH_URLS: Record<string, string> = {
          sandbox: "https://homeservices.apinaranja.com/security-ms/api/security/authB/b2b/m2msPrivate",
          production: "https://services.apinaranja.com/security-ms/api/security/authB/b2b/m2msPrivate",
        };

        if (clientId && clientSecret && audience) {
          const tokenRes = await fetch(AUTH_URLS[mode] || AUTH_URLS.sandbox, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, audience }),
          });

          if (tokenRes.ok) {
            const { access_token } = await tokenRes.json();
            const checkRes = await fetch(paymentCheckUrl, {
              headers: { Authorization: `Bearer ${access_token}`, "Content-Type": "application/json" },
            });
            if (checkRes.ok) {
              const checkData = await checkRes.json();
              statusName = checkData.status?.name || null;
            }
          }
        }
      } catch (e) {
        console.error("Nave: error consultando payment_check_url:", e);
      }
    }

    // Fallback: inferir estado desde el propio cuerpo del webhook si no pudimos consultar
    if (!statusName) {
      statusName = body.status?.name || body.status || null;
    }

    if (statusName === "APPROVED") {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: "PAID" },
      });
      console.log(`Order ${orderId} marcada como PAID via Nave`);
    } else if (statusName === "REJECTED" || statusName === "CANCELLED") {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: "CANCELLED" },
      });
      console.log(`Order ${orderId} marcada como CANCELLED via Nave (status: ${statusName})`);
    } else {
      console.log(`Nave webhook: status "${statusName}" para orden ${orderId} — sin acción`);
    }

    // Siempre responder 200 para que Nave no reintente
    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Nave Webhook Error:", error);
    // Responder 200 igual para evitar reintentos innecesarios
    return NextResponse.json({ received: true });
  }
}
