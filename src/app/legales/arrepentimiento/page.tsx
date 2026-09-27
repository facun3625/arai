import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle, Mail } from "lucide-react";
import { getLegalSettings } from "@/lib/legalSettings";

export const metadata: Metadata = {
    title: "Botón de Arrepentimiento - Araí Yerba Mate",
    description: "Ejercé tu derecho de arrepentimiento sobre una compra reciente en Araí Yerba Mate.",
};

export const dynamic = "force-dynamic";

export default async function ArrepentimientoPage() {
    const legal = await getLegalSettings();
    const email = legal.email || null;
    const whatsappNumber = legal.whatsappNumber || null;
    const message = "Hola! Quiero ejercer mi derecho de arrepentimiento sobre un pedido reciente. Mi número de pedido es: ____";

    return (
        <main className="max-w-2xl mx-auto px-4 py-20 md:py-28 font-montserrat">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Botón de Arrepentimiento</h1>
            <p className="text-gray-600 leading-relaxed mb-8">
                Si compraste en este sitio y todavía estás dentro de los <strong>10 días corridos</strong> desde
                que recibiste tu pedido, podés arrepentirte de la compra sin dar ningún motivo, según el Art. 34 de
                la Ley de Defensa del Consumidor N.º 24.240. Para ejercer este derecho, contactanos por cualquiera
                de estos medios indicando tu número de pedido:
            </p>

            <div className="space-y-4 mb-10">
                {whatsappNumber ? (
                    <a
                        href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl text-sm font-semibold transition-colors"
                    >
                        <MessageCircle className="h-4 w-4" />
                        Solicitar por WhatsApp
                    </a>
                ) : null}
                {email ? (
                    <a
                        href={`mailto:${email}?subject=${encodeURIComponent("Derecho de arrepentimiento")}&body=${encodeURIComponent(message)}`}
                        className="w-full flex items-center justify-center gap-2 px-6 py-4 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl text-sm font-semibold transition-colors"
                    >
                        <Mail className="h-4 w-4" />
                        Solicitar por email
                    </a>
                ) : null}
                {!whatsappNumber && !email && (
                    <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">
                        [Completar WhatsApp y email de contacto desde el panel para habilitar estos botones]
                    </p>
                )}
            </div>

            <p className="text-sm text-gray-500">
                Una vez recibida tu solicitud te confirmamos los pasos a seguir. Consultá también las condiciones
                completas en{" "}
                <Link href="/legales/devoluciones" className="text-primary underline">
                    Cambios y Devoluciones
                </Link>.
            </p>
        </main>
    );
}
