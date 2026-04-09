import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "messages requerido" }, { status: 400 });
    }

    // Cargar contexto en paralelo
    const [products, knowledgeDocs, settings] = await Promise.all([
      prisma.product.findMany({
        where: { stock: { gt: 0 } },
        include: { categories: true, variants: true },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.knowledgeDocument.findMany({
        where: { isActive: true },
        select: { title: true, content: true },
      }),
      prisma.storeSettings.findUnique({ where: { id: "global" } }),
    ]);

    // Construir resumen de productos
    const productsSummary = products
      .map((p) => {
        const price = p.variants.length
          ? Math.min(...p.variants.map((v) => v.price))
          : p.price;
        const stock = p.variants.length
          ? p.variants.reduce((sum, v) => sum + v.stock, 0)
          : p.stock;
        const cats = p.categories.map((c) => c.name).join(", ");
        return `- ${p.name} | Precio: $${price} | Stock: ${stock} | Categoría: ${cats}${p.description ? ` | ${p.description.slice(0, 100)}` : ""}`;
      })
      .join("\n");

    // Construir contexto de negocio desde documentos
    const businessContext = knowledgeDocs
      .map((d) => `### ${d.title}\n${d.content}`)
      .join("\n\n---\n\n");

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

    const systemPrompt = `Sos el vendedor IA de Araí Yerba Mate. Tu nombre es Araí. Sos un experto mateador, cálido, consultivo y apasionado por el producto.

Tu rol es guiar al cliente para encontrar la yerba ideal, responder preguntas sobre envíos, pagos y stock, y ayudar en el proceso de compra. Nunca despachás productos — acompañás la elección.

CATÁLOGO ACTUAL (solo productos con stock):
${productsSummary || "No hay productos disponibles en este momento."}

MEDIOS DE PAGO: ${paymentInfo || "Consultar en tienda"}
ENVÍOS: ${shippingInfo || "Consultar disponibilidad"}

CONOCIMIENTO DEL NEGOCIO:
${businessContext || ""}

INSTRUCCIONES:
- Respondé siempre en español, de forma cálida y natural
- Hacé preguntas consultivas antes de recomendar ("¿cómo te gusta el mate?", "¿te cae pesado?")
- Cuando recomendés un producto, mencioná el nombre exacto y precio
- Si preguntan por envíos, explicá las opciones disponibles
- Si preguntan por pagos, mencioná los métodos y el descuento por transferencia
- Mantené respuestas cortas (máx 3-4 párrafos)
- No inventés precios ni productos que no estén en el catálogo
- Si no sabés algo, decilo honestamente y ofrecé contactar por WhatsApp`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content || "No pude procesar tu consulta. ¿Podés reformularla?";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
