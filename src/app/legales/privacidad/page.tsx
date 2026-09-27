import type { Metadata } from "next";
import { getLegalSettings, legalField } from "@/lib/legalSettings";

export const metadata: Metadata = {
    title: "Política de Privacidad - Araí Yerba Mate",
    description: "Cómo tratamos tus datos personales en la tienda oficial de Araí Yerba Mate.",
};

export const dynamic = "force-dynamic";

export default async function PrivacidadPage() {
    const legal = await getLegalSettings();
    const businessName = legalField(legal.businessName, "razón social");
    const cuit = legalField(legal.cuit, "CUIT");
    const address = legalField(legal.address, "domicilio legal");
    const email = legal.email || "[Completar email de contacto desde el panel]";

    return (
        <main className="max-w-3xl mx-auto px-4 py-20 md:py-28 font-montserrat">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Política de Privacidad</h1>
            <p className="text-sm text-gray-400 mb-12">Última actualización: {new Date().toLocaleDateString("es-AR", { year: "numeric", month: "long", day: "numeric" })}</p>

            <div className="prose prose-neutral max-w-none space-y-8 text-gray-700 leading-relaxed">
                <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Responsable del tratamiento</h2>
                    <p>
                        <strong>{businessName}</strong> (CUIT {cuit}), con domicilio en <strong>{address}</strong>,
                        es responsable del tratamiento de los datos personales recolectados a través de este sitio.
                        Contacto: {email}.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Datos que recolectamos</h2>
                    <p>Al comprar o crear una cuenta podemos recolectar: nombre y apellido, DNI, email, teléfono,
                        dirección de envío y facturación. No almacenamos números de tarjeta ni datos sensibles de
                        pago: estos son procesados directamente por nuestros proveedores de pago (por ejemplo,
                        Mercado Pago), bajo sus propias políticas de seguridad.</p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Finalidad</h2>
                    <p>Usamos tus datos para: procesar y entregar tus pedidos, emitir comprobantes, coordinar el
                        envío, responder consultas, y (solo si diste tu consentimiento) enviarte comunicaciones
                        comerciales por email o WhatsApp.</p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Con quién compartimos datos</h2>
                    <p>Compartimos los datos estrictamente necesarios con: procesadores de pago (Mercado Pago),
                        empresas de logística (OCA y/o el operador de envío activo), y plataformas de analítica y
                        publicidad (Meta/Facebook, Google Analytics) para medir el rendimiento del sitio y de las
                        campañas. No vendemos datos personales a terceros.</p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Cookies</h2>
                    <p>Este sitio utiliza cookies propias y de terceros para su funcionamiento (carrito, sesión) y
                        para medir tráfico y campañas publicitarias. Podés gestionar las cookies desde la
                        configuración de tu navegador.</p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Tus derechos (Ley 25.326)</h2>
                    <p>Tenés derecho de acceso, rectificación, actualización y supresión de tus datos personales.
                        Para ejercerlos escribinos a {email}. La Agencia de Acceso a la Información Pública, en su
                        carácter de Órgano de Control de la Ley N.º 25.326, tiene la atribución de atender las
                        denuncias y reclamos que se interpongan con relación al incumplimiento de las normas sobre
                        protección de datos personales.</p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Conservación de datos</h2>
                    <p>Conservamos tus datos mientras mantengas una cuenta activa o mientras sea necesario para
                        cumplir obligaciones legales (por ejemplo, fiscales), y los eliminamos o anonimizamos
                        cuando dejan de ser necesarios.</p>
                </section>
            </div>
        </main>
    );
}
