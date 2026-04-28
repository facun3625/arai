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

function removeAccents(s: string): string {
    return s.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function parseApartment(apt: string): { piso: string; depto: string } {
    const trimmed = apt?.trim() ?? "";
    const numMatch = trimmed.match(/^(\d+)/);
    const alphaMatch = trimmed.match(/[a-zA-Z]+$/);
    return {
        piso: numMatch ? numMatch[1] : "",
        depto: alphaMatch ? alphaMatch[0].toUpperCase() : ""
    };
}

function sanitizeEmail(e: string): string {
    const trimmed = e?.trim() ?? "";
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed) ? trimmed : "";
}

function normalizeProvince(p: string): string {
    const t = p?.trim() ?? "";
    const cabaVariants = ["CABA", "Capital Federal", "Ciudad Autónoma de Buenos Aires", "Ciudad Autonoma de Buenos Aires", "capital federal"];
    return cabaVariants.includes(t) ? "CAPITAL FEDERAL" : removeAccents(t.toUpperCase());
}

function normalizeCity(city: string, normalizedProvince: string): string {
    const t = city?.trim() ?? "";
    if (normalizedProvince === "CAPITAL FEDERAL") return "CAPITAL FEDERAL";
    return removeAccents(t.toUpperCase());
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

        const originStreet = settings?.ocaOriginStreet || "";
        const originNumber = settings?.ocaOriginNumber || "";
        const originFloor = settings?.ocaOriginFloor || "";
        const originZip = settings?.ocaOriginZipCode || "";
        const originStreetClean = removeAccents((settings?.ocaOriginStreet || "").toUpperCase());
        const originCity = removeAccents((settings?.ocaOriginCity || "").toUpperCase());
        const originProvince = removeAccents((settings?.ocaOriginProvince || "").toUpperCase());
        const originContact = removeAccents(settings?.ocaOriginContact || "");
        const originEmail = sanitizeEmail(settings?.ocaOriginEmail || "");
        const franjaHoraria = settings?.ocaFranjaHoraria || "1";

        const addr = typeof order.shippingAddress === "string"
            ? JSON.parse(order.shippingAddress)
            : order.shippingAddress as any;

        const totalItems = order.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
        const pesoKg = Math.max(1, Math.ceil(totalItems * 0.5));
        const idCentro = addr?.branchId || "0";
        const nroRemito = String((order as any).orderNumber || parseInt(orderId.replace(/\D/g, "").slice(-6) || "1", 10) || 1);
        const provincia = normalizeProvince(addr?.province || "");
        const localidad = normalizeCity(addr?.city || "", provincia);
        const email = sanitizeEmail(order.contactEmail || "");
        const { piso, depto } = parseApartment(addr?.apartment || "");
        const fecha = new Date().toISOString().slice(0, 10).replace(/-/g, "");

        const xmlDatos = `<?xml version="1.0" encoding="iso-8859-1" standalone="yes"?><ROWS><cabecera ver="2.0" nrocuenta="${escapeXml(nroCliente)}" /><origenes><origen calle="${escapeXml(originStreetClean)}" nro="${escapeXml(originNumber)}" piso="${escapeXml(originFloor)}" depto="" cp="${escapeXml(originZip)}" localidad="${escapeXml(originCity)}" provincia="${escapeXml(originProvince)}" contacto="${escapeXml(originContact)}" email="${escapeXml(originEmail)}" solicitante="" observaciones="" centrocosto="0" idfranjahoraria="${franjaHoraria}" idcentroimposicionorigen="0" fecha="${fecha}"><envios><envio idoperativa="${escapeXml(operativa)}" nroremito="${nroRemito}"><destinatario apellido="${escapeXml(removeAccents((order.contactLastName || "").trim()))}" nombre="${escapeXml(removeAccents((order.contactName || "").trim()))}" calle="${escapeXml(removeAccents((addr?.street || "").trim()))}" nro="${escapeXml((addr?.number || "").trim())}" piso="${escapeXml(piso)}" depto="${escapeXml(depto)}" localidad="${escapeXml(localidad)}" provincia="${escapeXml(provincia)}" cp="${(addr?.zipCode || "").trim()}" telefono="${(order.contactPhone || "").trim()}" email="${escapeXml(email)}" idci="${idCentro}" celular="${(order.contactPhone || "").trim()}" observaciones="" /><paquetes><paquete alto="15" ancho="15" largo="15" peso="${pesoKg}" valor="${Math.round(order.total)}" cant="1" /></paquetes></envio></envios></origen></origenes></ROWS>`;

        console.log("OCA IngresoOR XML:", xmlDatos);

        const formBody = new URLSearchParams({
            usr,
            psw,
            xml_Datos: xmlDatos,
            ConfirmarRetiro: "false",
            DiasHastaRetiro: "0",
            idFranjaHoraria: franjaHoraria,
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
