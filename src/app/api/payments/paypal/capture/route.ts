import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const PAYPAL_URLS = {
  sandbox: "https://api-m.sandbox.paypal.com",
  production: "https://api-m.paypal.com",
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token"); // PayPal order ID
    const orderId = searchParams.get("orderId"); // our order ID

    if (!token || !orderId) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/checkout?error=paypal`);
    }

    const settings = await prisma.storeSettings.findUnique({ where: { id: "global" } });
    const clientId = settings?.paypalClientId || process.env.PAYPAL_CLIENT_ID;
    const secret = settings?.paypalSecret || process.env.PAYPAL_SECRET;
    const mode = (settings?.paypalMode || "sandbox") as "sandbox" | "production";
    const baseUrl = PAYPAL_URLS[mode];

    // Get access token
    const tokenRes = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${clientId}:${secret}`).toString("base64")}`,
      },
      body: "grant_type=client_credentials",
    });

    const { access_token } = await tokenRes.json();

    // Capture the order
    const captureRes = await fetch(`${baseUrl}/v2/checkout/orders/${token}/capture`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (captureRes.ok) {
      const capture = await captureRes.json();
      if (capture.status === "COMPLETED") {
        await prisma.order.update({
          where: { id: orderId },
          data: { status: "PAID" },
        });
        return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/checkout/success?orderId=${orderId}`);
      }
    }

    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/checkout?error=paypal_capture`);
  } catch (error) {
    console.error("PayPal capture error:", error);
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/checkout?error=paypal`);
  }
}
