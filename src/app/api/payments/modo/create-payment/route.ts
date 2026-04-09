import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const BASE_URLS: Record<string, string> = {
  preprod: "https://merchants.preprod.playdigital.com.ar",
  production: "https://merchants.playdigital.com.ar",
};

// Cache del token en memoria (válido 1 semana, rate limit 10 req/10min)
let cachedToken: { token: string; expiresAt: number } | null = null;

async function getModoToken(baseUrl: string, username: string, password: string): Promise<string> {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now) {
    return cachedToken.token;
  }

  const res = await fetch(`${baseUrl}/v2/stores/companies/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "User-Agent": "Mozilla/5.0 (compatible; AraíStore/1.0)",
    },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Modo auth error:", err);
    throw new Error("Error al autenticar con Modo");
  }

  const data = await res.json();
  const token = data.access_token || data.token;

  // Token válido por 1 semana, cacheamos por 6 días
  cachedToken = { token, expiresAt: now + 6 * 24 * 60 * 60 * 1000 };
  return token;
}

export async function POST(req: Request) {
  try {
    const { orderId, amount } = await req.json();

    const settings = await prisma.storeSettings.findUnique({ where: { id: "global" } });

    if (!settings?.modoEnabled) {
      return NextResponse.json({ error: "Modo no está habilitado" }, { status: 403 });
    }

    const username = settings.modoPublicKey || process.env.MODO_USERNAME;
    const password = settings.modoPrivateKey || process.env.MODO_PASSWORD;
    const mode = settings.modoMode || "preprod";
    const baseUrl = BASE_URLS[mode] || BASE_URLS.preprod;

    if (!username || !password) {
      return NextResponse.json({ error: "Credenciales de Modo no configuradas" }, { status: 500 });
    }

    const token = await getModoToken(baseUrl, username, password);

    const paymentRes = await fetch(`${baseUrl}/v2/payment-requests/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "User-Agent": "Araí Yerba Mate",
      },
      body: JSON.stringify({
        external_intention_id: orderId,
        amount: Number(amount).toFixed(2),
        currency: "ARS",
        description: `Pedido Araí #${orderId.slice(-8).toUpperCase()}`,
      }),
    });

    if (!paymentRes.ok) {
      const err = await paymentRes.text();
      console.error("Modo payment error:", err);
      // Si el token expiró, limpiamos el cache y reintentamos una vez
      if (paymentRes.status === 401) {
        cachedToken = null;
        return NextResponse.json({ error: "Token expirado, reintentá" }, { status: 401 });
      }
      return NextResponse.json({ error: "Error al crear la intención de pago en Modo" }, { status: 500 });
    }

    const data = await paymentRes.json();

    return NextResponse.json({
      id: data.id,
      qr: data.qr || data.qr_string,
      deeplink: data.deeplink || data.deep_link,
    });
  } catch (error: any) {
    console.error("Modo create-payment error:", error);
    return NextResponse.json({ error: error.message || "Error interno" }, { status: 500 });
  }
}
