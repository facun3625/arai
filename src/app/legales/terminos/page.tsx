import type { Metadata } from "next";
import Link from "next/link";
import { getLegalSettings, legalField } from "@/lib/legalSettings";

export const metadata: Metadata = {
    title: "Términos y Condiciones - Araí Yerba Mate",
    description: "Términos y condiciones de compra de la tienda oficial de Araí Yerba Mate.",
};

export const dynamic = "force-dynamic";

export default async function TerminosPage() {
    const legal = await getLegalSettings();
    const businessName = legalField(legal.businessName, "razón social");
    const cuit = legalField(legal.cuit, "CUIT");
    const address = legalField(legal.address, "domicilio legal");
    const email = legal.email || "[Completar email de contacto desde el panel]";

    return (
        <main className="max-w-3xl mx-auto px-4 py-20 md:py-28 font-montserrat">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Términos y Condiciones</h1>
            <p className="text-sm text-gray-400 mb-12">Última actualización: {new Date().toLocaleDateString("es-AR", { year: "numeric", month: "long", day: "numeric" })}</p>

            <div className="prose prose-neutral max-w-none space-y-8 text-gray-700 leading-relaxed">
                <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Identificación del vendedor</h2>
                    <p>
                        Este sitio es operado por <strong>{businessName}</strong>, CUIT <strong>{cuit}</strong>,
                        con domicilio legal en <strong>{address}</strong>. Para consultas: {email}.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Aceptación de los términos</h2>
                    <p>
                        Al utilizar este sitio y realizar una compra, el usuario acepta estos Términos y Condiciones,
                        la Política de Privacidad y la política de Cambios y Devoluciones. Si no está de acuerdo,
                        debe abstenerse de utilizar el sitio.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Productos y precios</h2>
                    <p>
                        Los precios se expresan en pesos argentinos (ARS) e incluyen los impuestos vigentes, salvo
                        que se indique lo contrario. Los precios pueden modificarse sin previo aviso, pero el precio
                        aplicado a una compra ya confirmada no se modifica.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Medios de pago</h2>
                    <p>
                        Se aceptan los medios de pago habilitados en el checkout (Mercado Pago, transferencia bancaria
                        y/o los que estén activos al momento de la compra). El pedido se confirma una vez acreditado
                        o verificado el pago según el medio elegido.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Envíos</h2>
                    <p>
                        Los plazos y costos de envío se informan durante el checkout antes de confirmar la compra.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Cambios, devoluciones y derecho de arrepentimiento</h2>
                    <p>
                        Consultá las condiciones completas en{" "}
                        <Link href="/legales/devoluciones" className="text-primary underline">
                            Cambios y Devoluciones
                        </Link>{" "}
                        y en el{" "}
                        <Link href="/legales/arrepentimiento" className="text-primary underline">
                            Botón de Arrepentimiento
                        </Link>.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Propiedad intelectual</h2>
                    <p>
                        Las marcas, logos, textos e imágenes de este sitio pertenecen a {businessName} o a sus
                        respectivos titulares y no pueden reproducirse sin autorización.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Ley aplicable y jurisdicción</h2>
                    <p>
                        Estos términos se rigen por las leyes de la República Argentina, incluyendo la Ley de
                        Defensa del Consumidor N.º 24.240. Ante cualquier conflicto, las partes se someten a los
                        tribunales ordinarios competentes según el domicilio del consumidor.
                    </p>
                </section>
            </div>
        </main>
    );
}
