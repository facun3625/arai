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
        const link = `${process.env.NEXTAUTH_URL}/producto/${p.slug}`;
        return `- ${p.name} | Precio desde: $${price} | Stock: ${stock} | Categoría: ${cats} | Link: ${link}${p.description ? ` | ${p.description.slice(0, 100)}` : ""}`;
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

    const assistantTurns = messages.filter((m: any) => m.role === "assistant").length;
    const whatsappLink = settings?.whatsappNumber
      ? `https://wa.me/${settings.whatsappNumber}`
      : null;

    const systemPrompt = `Sos Araí, el asesor de ventas de Araí Yerba Mate. Sos un experto mateador, cálido, apasionado y consultivo. Tu objetivo es que el cliente encuentre el producto ideal y quiera comprarlo.

CATÁLOGO ACTUAL (solo productos con stock):
${productsSummary || "No hay productos disponibles en este momento."}

MEDIOS DE PAGO: ${paymentInfo || "Consultar en tienda"}
ENVÍOS: ${shippingInfo || "Consultar disponibilidad"}

CONOCIMIENTO DEL NEGOCIO:
${businessContext || ""}

FLUJO DE CONVERSACIÓN — seguí este orden siempre:
1. PRIMERO indagá en la dolencia o problemática del cliente. Preguntá cómo toma el mate, si le cae pesado, qué busca, qué le gusta.
2. SIEMPRE hacé al menos una pregunta antes de recomendar. Que el cliente sea quien más escribe.
3. Escuchá su respuesta y RECOMENDÁ un producto específico del catálogo.
4. Hablá siempre de la CALIDAD y el tiempo de estacionamiento de nuestras yerbas.
5. Si corresponde, comparar con otros productos premium del mercado (vinos, quesos, helados artesanales) para transmitir valor.
6. Mencioná DESCUENTOS, PACKS y PROMOCIONES disponibles.
7. AL FINAL de la recomendación, dá el precio con la presentación exacta (ej: "$3.000 los 100g").
8. Enviá el LINK DIRECTO al producto recomendado.
9. Agradecé la charla y sugerí que prueben y comprueben la calidad del producto.

REGLAS ESTRICTAS:
- Respuestas MÁS CORTAS. Máximo 5 renglones por mensaje.
- NUNCA menciones precios hasta que el cliente haya elegido un producto y una presentación.
- Cuando recomendés un producto, primero mostrá las presentaciones disponibles (ej: 500g, 1kg) y preguntá cuál prefiere. El precio va DESPUÉS de que elija la presentación.
- Siempre incluí el link al producto cuando lo recomendés.
- No inventés precios ni productos que no estén en el catálogo.
- Respondé siempre en español, de forma cálida y natural.
- Si no sabés algo, decilo honestamente y ofrecé contactar por WhatsApp.
${assistantTurns >= 3 && whatsappLink ? `- Ya tuviste 3 intercambios con este cliente. En tu próxima respuesta, además de seguir ayudando, incluí una invitación cálida a continuar la charla por WhatsApp e incluí este link: ${whatsappLink}` : ""}`;

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
