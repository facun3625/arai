import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseStringPromise } from "xml2js";

function escapeXml(str: string): string {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

export async function POST(req: Request) {
    try {
        const { orderId, adminId } = await req.json();

        if (!orderId || !adminId) {
            return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
        }

        const admin = await prisma.user.findUnique({ where: { id: adminId } });
        if (!admin || admin.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { items: true }
        });

        if (!order) {
            return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
        }
        if (order.trackingNumber) {
            return NextResponse.json({ error: "Este pedido ya tiene un rótulo generado", nroOR: order.trackingNumber }, { status: 409 });
        }

        const settings = await prisma.storeSettings.findUnique({ where: { id: "global" } });

        const usr = settings?.ocaUser;
        const psw = settings?.ocaPassword;
        const nroCliente = settings?.ocaNroCliente;
        const operativa = order.shippingMethod === "oca_sucursal"
            ? (settings?.ocaOperativaSucursal || settings?.ocaOperativa)
            : settings?.ocaOperativa;

        if (!usr || !psw || !nroCliente || !operativa) {
            return NextResponse.json({
                error: "Configuración OCA incompleta. Verificá usuario, contraseña y número de cliente en Ajustes → Envío."
            }, { status: 500 });
        }

        const addr = typeof order.shippingAddress === "string"
            ? JSON.parse(order.shippingAddress)
            : order.shippingAddress as any;

        const normalizeProvince = (p: string): string => {
            const t = p?.trim() ?? "";
            const cabaVariants = ["CABA", "Capital Federal", "Ciudad Autónoma de Buenos Aires", "Ciudad Autonoma de Buenos Aires", "capital federal"];
            return cabaVariants.includes(t) ? "CABA" : t;
        };

        const normalizeCity = (city: string, province: string): string => {
            const t = city?.trim() ?? "";
            if (province === "CABA") return "CIUDAD AUTONOMA BUENOS AIRES";
            return t.toUpperCase();
        };

        const toTitleCase = (s: string): string =>
            s.trim().replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());

        const sanitizeEmail = (e: string): string => {
            const trimmed = e?.trim() ?? "";
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed) ? trimmed : "";
        };

        // Remove accents — OCA's .NET backend may not handle UTF-8 accented chars correctly
        const removeAccents = (s: string): string =>
            s.normalize("NFD").replace(/[̀-ͯ]/g, "");

        // Split apartment into floor (numeric) and unit (alpha) for OCA's Piso/Depto fields
        const parseApartment = (apt: string): { piso: string; depto: string } => {
            const trimmed = apt?.trim() ?? "";
            const numMatch = trimmed.match(/^(\d+)/);
            const alphaMatch = trimmed.match(/[a-zA-Z]+$/);
            return {
                piso: numMatch ? numMatch[1] : "",
                depto: alphaMatch ? alphaMatch[0].toUpperCase() : ""
            };
        };

        const totalItems = order.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
        const pesoTotal = Math.max(0.5, totalItems * 0.5).toFixed(3);
        const volumen = (0.000027).toFixed(9);
        const idCentro = addr?.branchId || "0";
        const nroEnvio = String(parseInt(orderId.replace(/\D/g, "").slice(-6) || "1", 10) || 1);
        const provincia = normalizeProvince(addr?.province || "");
        const localidad = normalizeCity(addr?.city || "", provincia);
        const email = sanitizeEmail(order.contactEmail || "");
        const { piso, depto } = parseApartment(addr?.apartment || "");

        const xmlDatos = `<Datos><Origen NroCliente="${escapeXml(nroCliente)}" Operativa="${escapeXml(operativa)}" /><Envio NroEnvio="${nroEnvio}" PesoTotal="${pesoTotal}" VolumenTotal="${volumen}" CantidadPaquetes="1" Valor="${Math.round(order.total)}" COD="0" Calle="${escapeXml(removeAccents((addr?.street || "").trim()))}" Numero="${escapeXml((addr?.number || "").trim())}" Piso="${escapeXml(piso)}" Depto="${escapeXml(depto)}" Localidad="${escapeXml(removeAccents(localidad))}" Provincia="${escapeXml(removeAccents(provincia))}" CodigoPostal="${(addr?.zipCode || "").trim()}" Telefono="${(order.contactPhone || "").trim()}" Email="${escapeXml(email)}" IdCentroImposicionDestino="${idCentro}"><Destinatario NroDoc="${order.contactDni || ""}" Tipo="DNI" Nombre="${escapeXml(removeAccents((order.contactName || "").trim()))}" Apellido="${escapeXml(removeAccents((order.contactLastName || "").trim()))}" /><Paquetes><Paquete NroPaquete="1" Alto="15" Ancho="15" Largo="15" Peso="${pesoTotal}" Valor="${Math.round(order.total)}" /></Paquetes></Envio></Datos>`;

        console.log("OCA IngresoOR XML:", xmlDatos);

        const formBody = new URLSearchParams({
            usr,
            psw,
            xml_Datos: xmlDatos,
            ConfirmarRetiro: "false",
            DiasHastaRetiro: "0",
            idFranjaHoraria: "0",
            ArchivoCliente: "",
            ArchivoProceso: ""
        });

        const response = await fetch("http://webservice.oca.com.ar/ePak_tracking/Oep_TrackEPak.asmx/IngresoOR", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: formBody.toString()
        });

        const xmlResult = await response.text();
        console.log("OCA IngresoOR response:", xmlResult);

        const parsed = await parseStringPromise(xmlResult, {
            explicitArray: false,
            ignoreAttrs: false,
            tagNameProcessors: [(name) => name.replace(/.*:/, "")]
        });

        // Check for errors in response
        const findError = (obj: any): string | null => {
            if (!obj || typeof obj !== "object") return null;
            if (obj.Descripcion) return String(obj.Descripcion);
            for (const key in obj) {
                if (key === "_") continue;
                const found = findError(obj[key]);
                if (found) return found;
            }
            return null;
        };

        // Find the OR number — successful response has a Table with numeric value
        const findNroOR = (obj: any): string | null => {
            if (!obj || typeof obj !== "object") return null;
            if (obj.Table !== undefined) {
                const t = obj.Table;
                const val = typeof t === "string" ? t : (t._ || t.Resultado || t.NroOR || t.Value);
                if (val && !isNaN(Number(val))) return String(val).trim();
            }
            for (const key in obj) {
                if (key === "_") continue;
                const found = findNroOR(obj[key]);
                if (found) return found;
            }
            return null;
        };

        // If Errores schema found, it's an error response
        const errorMsg = findError(parsed);
        if (errorMsg && errorMsg !== "[object Object]") {
            console.error("OCA error:", errorMsg);
            return NextResponse.json({ error: `OCA: ${errorMsg}` }, { status: 400 });
        }

        const nroOR = findNroOR(parsed);
        console.log("OCA nroOR:", nroOR);

        if (!nroOR || isNaN(Number(nroOR))) {
            console.error("Could not extract NroOR from:", JSON.stringify(parsed, null, 2));
            return NextResponse.json({ error: "OCA no devolvió un número de OR válido" }, { status: 400 });
        }

        await prisma.order.update({
            where: { id: orderId },
            data: { trackingNumber: nroOR }
        });

        return NextResponse.json({ success: true, nroOR });

    } catch (error: any) {
        console.error("IngresoOR Error:", error);
        return NextResponse.json({ error: "Error al registrar en OCA: " + error.message }, { status: 500 });
    }
}
