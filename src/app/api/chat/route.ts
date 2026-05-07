import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  try {
    const { messages, sessionId } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "messages requerido" }, { status: 400 });
    }

    // Cargar contexto en paralelo
    const [products, knowledgeDocs, settings] = await Promise.all([
      prisma.product.findMany({
        where: { stock: { gt: 0 } },
        include: { categories: true, variants: true },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.knowledgeDocument.findMany({
        where: { isActive: true },
        select: { title: true, content: true },
      }),
      prisma.storeSettings.findUnique({ where: { id: "global" } }),
    ]);

    // Construir resumen de productos (compacto para ahorrar tokens)
    const productsSummary = products
      .map((p) => {
        const price = p.variants.length
          ? Math.min(...p.variants.map((v) => v.price))
          : p.price;
        const cats = p.categories.map((c) => c.name).join("/");
        const link = `${process.env.NEXTAUTH_URL}/producto/${p.slug}`;
        return `- ${p.name} | $${price} | ${cats} | ${link}`;
      })
      .join("\n");

    // Construir contexto de negocio desde documentos (truncado)
    const businessContext = knowledgeDocs
      .map((d) => `${d.title}: ${d.content.slice(0, 300)}`)
      .join("\n");

    // Info de pagos y envíos
    const paymentInfo = [
      settings?.mercadopagoEnabled ? "Mercado Pago" : null,
      settings?.modoEnabled ? "Modo" : null,
      "Transferencia bancaria" + (settings?.bankTransferDiscount ? ` (${settings.bankTransferDiscount}% de descuento)` : ""),
    ]
      .filter(Boolean)
      .join(", ");

    const shippingInfo = [
      settings?.ocaEnabled ? "OCA (envío a domicilio y sucursal)" : null,
      settings?.freeShippingThreshold
        ? `Envío gratis a partir de $${settings.freeShippingThreshold}`
        : null,
    ]
      .filter(Boolean)
      .join(". ");

    const assistantTurns = messages.filter((m: any) => m.role === "assistant").length;
    const whatsappLink = settings?.whatsappNumber
      ? `https://wa.me/${settings.whatsappNumber}`
      : null;

    const systemPrompt = `Sos Araí, asesora de ventas de Araí Yerba Mate. Cálida, experta, consultiva. Máximo 4 oraciones por respuesta.

CATÁLOGO (con stock):
${productsSummary || "Sin productos disponibles."}

PAGOS: ${paymentInfo || "Consultar"} | ENVÍOS: ${shippingInfo || "Consultar"}
${businessContext ? `INFO: ${businessContext}` : ""}

REGLAS:
- Preguntá al menos una vez antes de recomendar.
- Nunca inventes precios ni productos.
- Siempre incluí el link al recomendar.
- Respondé en español, natural y cálido.
- No menciones precios hasta que el cliente elija presentación.${assistantTurns >= 3 && whatsappLink ? `\n- Invitá a continuar por WhatsApp: ${whatsappLink}` : ""}`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
      max_tokens: 350,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content || "No pude procesar tu consulta. ¿Podés reformularla?";

    // Persist conversation asynchronously (don't block response)
    if (sessionId) {
      (async () => {
        try {
          const conversation = await prisma.conversation.upsert({
            where: { sessionId },
            create: { sessionId },
            update: { updatedAt: new Date() },
            include: { messages: { select: { id: true } } },
          });
          const existingCount = conversation.messages.length;
          const newMessages = messages.slice(existingCount);
          if (newMessages.length > 0) {
            await prisma.conversationMessage.createMany({
              data: newMessages.map((m: { role: string; content: string }) => ({
                conversationId: conversation.id,
                role: m.role,
                content: m.content,
              })),
            });
          }
          await prisma.conversationMessage.create({
            data: { conversationId: conversation.id, role: "assistant", content: reply },
          });
        } catch (e) {
          console.error("Error saving conversation:", e);
        }
      })();
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
