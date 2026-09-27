import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { FaqAccordion } from "./FaqAccordion";

export const metadata: Metadata = {
    title: "Preguntas Frecuentes - Araí Yerba Mate",
    description: "Envíos, pagos, cambios y devoluciones: resolvé tus dudas antes de comprar en Araí Yerba Mate.",
    alternates: { canonical: "/faq" },
};

export const dynamic = "force-dynamic";

export default async function FaqPage() {
    const items = await prisma.faqItem.findMany({
        where: { isActive: true },
        orderBy: { order: "asc" },
    });

    const jsonLd = items.length > 0 ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: items.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
    } : null;

    return (
        <main className="max-w-3xl mx-auto px-4 py-20 md:py-28 font-montserrat">
            {jsonLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            )}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Preguntas Frecuentes</h1>
            <p className="text-gray-500 mb-12">Todo lo que necesitás saber antes de comprar.</p>

            {items.length > 0 ? (
                <FaqAccordion items={items.map(i => ({ id: i.id, question: i.question, answer: i.answer }))} />
            ) : (
                <p className="text-gray-400 text-sm">Todavía no cargamos preguntas frecuentes. Volvé pronto.</p>
            )}
        </main>
    );
}
