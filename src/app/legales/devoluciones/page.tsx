import type { Metadata } from "next";
import Link from "next/link";
import { getLegalSettings } from "@/lib/legalSettings";

export const metadata: Metadata = {
    title: "Cambios y Devoluciones - Araí Yerba Mate",
    description: "Política de cambios, devoluciones y derecho de arrepentimiento de Araí Yerba Mate.",
};

export const dynamic = "force-dynamic";

export default async function DevolucionesPage() {
    const legal = await getLegalSettings();
    const email = legal.email || "[Completar email de contacto desde el panel]";

    return (
        <main className="max-w-3xl mx-auto px-4 py-20 md:py-28 font-montserrat">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Cambios y Devoluciones</h1>
            <p className="text-sm text-gray-400 mb-12">Última actualización: {new Date().toLocaleDateString("es-AR", { year: "numeric", month: "long", day: "numeric" })}</p>

            <div className="prose prose-neutral max-w-none space-y-8 text-gray-700 leading-relaxed">
                <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Derecho de arrepentimiento (10 días)</h2>
                    <p>
                        Según el Art. 34 de la Ley de Defensa del Consumidor N.º 24.240, tenés derecho a revocar tu
                        compra dentro de los <strong>10 días corridos</strong> desde que recibís el producto, sin
                        necesidad de justificar el motivo y sin costo adicional para vos, salvo el costo directo de
                        devolución del producto.
                    </p>
                    <p>
                        Para ejercer este derecho usá el{" "}
                        <Link href="/legales/arrepentimiento" className="text-primary underline">
                            Botón de Arrepentimiento
                        </Link>.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Condiciones para la devolución</h2>
                    <p>El producto debe devolverse sin uso, en su empaque original y en las mismas condiciones en
                        que fue entregado. Por tratarse de productos alimenticios, no aceptamos devoluciones de
                        paquetes de yerba mate, café o hierbas que ya hayan sido abiertos, salvo que presenten un
                        defecto de fabricación o estén vencidos.</p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Producto defectuoso o error en el envío</h2>
                    <p>Si recibiste un producto dañado, defectuoso o distinto al que compraste, escribinos a{" "}
                        {email} dentro de los 5 días de recibido el pedido, adjuntando fotos. En estos casos el
                        cambio, la devolución o el reintegro no tienen costo para vos.</p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Cómo devolver un producto</h2>
                    <ol className="list-decimal pl-5 space-y-1">
                        <li>Contactanos por {email} indicando el número de pedido y el motivo.</li>
                        <li>Te confirmamos la dirección y el medio para devolver el producto.</li>
                        <li>Una vez que recibimos y verificamos el producto, procesamos el reintegro.</li>
                    </ol>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Plazo de reintegro</h2>
                    <p>El reintegro se realiza por el mismo medio de pago utilizado en la compra, dentro de los
                        plazos que informe el procesador de pago o la entidad bancaria correspondiente.</p>
                </section>
            </div>
        </main>
    );
}
