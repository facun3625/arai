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

async function getCentroImposicion(cp: string): Promise<string> {
    try {
        const res = await fetch(
            `https://webservice.oca.com.ar/epak_tracking/Oep_TrackEPak.asmx/GetCentrosImposicionConServiciosByCP?CodigoPostal=${encodeURIComponent(cp)}`,
            { method: "GET" }
        );
        const xml = await res.text();
        console.log("OCA GetCentrosImposicionConServiciosByCP cp=" + cp + ":", xml.slice(0, 800));
        const parsed = await parseStringPromise(xml, {
            explicitArray: true,
            tagNameProcessors: [(name: string) => name.replace(/.*:/, "")]
        });
        const tables = parsed?.DataSet?.diffgram?.[0]?.NewDataSet?.[0]?.Table;
        if (Array.isArray(tables) && tables.length > 0) {
            const id = tables[0]?.IdCentroImposicion?.[0];
            if (id) {
                console.log("OCA CentroImposicionOrigen id=" + id + " for cp=" + cp);
                return String(id).trim();
            }
        }
    } catch (e) {
        console.error("OCA GetCentrosImposicionConServiciosByCP error:", e);
    }
    return "0";
}

async function getCentroCosto(cuit: string, operativa: string): Promise<string> {
    try {
        const params = new URLSearchParams({ CUIT: cuit, Operativa: operativa });
        const res = await fetch(
            "https://webservice.oca.com.ar/oep_tracking/Oep_Track.asmx/GetCentroCostoPorOperativa",
            { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: params.toString() }
        );
        const xml = await res.text();
        console.log("OCA GetCentroCostoPorOperativa:", xml.slice(0, 600));
        const parsed = await parseStringPromise(xml, {
            explicitArray: true,
            tagNameProcessors: [(name: string) => name.replace(/.*:/, "")]
        });
        const tables = parsed?.DataSet?.diffgram?.[0]?.NewDataSet?.[0]?.Table;
        if (Array.isArray(tables) && tables.length > 0) {
            const row = tables[0];
            const cc = row?.NroCentroCosto?.[0] ?? row?.CentroCosto?.[0] ?? row?.IdCentroCosto?.[0];
            if (cc) {
                console.log("OCA CentroCosto:", cc);
                return String(cc).trim();
            }
        }
    } catch (e) {
        console.error("OCA GetCentroCostoPorOperativa error:", e);
    }
    return "1";
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
        const cuit = settings?.ocaCuit || "";
        const [idCentroOrigen, centroCosto] = await Promise.all([
            getCentroImposicion(originZip),
            getCentroCosto(cuit, operativa)
        ]);

        const addr = typeof order.shippingAddress === "string"
            ? JSON.parse(order.shippingAddress)
            : order.shippingAddress as any;

        const totalWeightKg = order.items.reduce((sum: number, item: any) => sum + (Number(item.weight) || 1) * item.quantity, 0);
        const pesoKg = Math.max(1, Math.ceil(totalWeightKg));
        const idCentro = addr?.branchId || "0";
        const nroRemito = String((order as any).orderNumber || parseInt(orderId.replace(/\D/g, "").slice(-6) || "1", 10) || 1);
        const provincia = normalizeProvince(addr?.province || "");
        const localidad = normalizeCity(addr?.city || "", provincia);
        const email = sanitizeEmail(order.contactEmail || "");
        const { piso, depto } = parseApartment(addr?.apartment || "");
        const fecha = new Date().toISOString().slice(0, 10).replace(/-/g, "");

        const xmlDatos = `<?xml version="1.0" encoding="iso-8859-1" standalone="yes"?><ROWS><cabecera ver="2.0" nrocuenta="${escapeXml(nroCliente)}" origen="API" /><origenes><origen calle="${escapeXml(originStreetClean)}" nro="${escapeXml(originNumber)}" piso="${escapeXml(originFloor)}" depto="" cp="${escapeXml(originZip)}" localidad="${escapeXml(originCity)}" provincia="${escapeXml(originProvince)}" contacto="${escapeXml(originContact)}" email="${escapeXml(originEmail)}" solicitante="" observaciones="" centrocosto="${centroCosto}" idfranjahoraria="${franjaHoraria}" idcentroimposicionorigen="${idCentroOrigen}" fecha="${fecha}"><envios><envio idoperativa="${escapeXml(operativa)}" nroremito="${nroRemito}"><destinatario apellido="${escapeXml(removeAccents((order.contactLastName || "").trim()))}" nombre="${escapeXml(removeAccents((order.contactName || "").trim()))}" calle="${escapeXml(removeAccents((addr?.street || "").trim()))}" nro="${escapeXml((addr?.number || "").trim())}" piso="${escapeXml(piso)}" depto="${escapeXml(depto)}" localidad="${escapeXml(localidad)}" provincia="${escapeXml(provincia)}" cp="${(addr?.zipCode || "").trim()}" telefono="${(order.contactPhone || "").trim()}" email="${escapeXml(email)}" idci="${idCentro}" celular="${(order.contactPhone || "").trim()}" observaciones="" /><paquetes><paquete alto="15" ancho="15" largo="15" peso="${pesoKg}" valor="0" cant="1" /></paquetes></envio></envios></origen></origenes></ROWS>`;

        console.log("OCA IngresoORMultiplesRetiros XML:", xmlDatos);

        const formBody = new URLSearchParams({
            usr,
            psw,
            XML_Datos: xmlDatos,
            ConfirmarRetiro: "true",
            ArchivoCliente: "",
            ArchivoProceso: ""
        });

        const response = await fetch("https://webservice.oca.com.ar/ePak_tracking/Oep_TrackEPak.asmx/IngresoORMultiplesRetiros", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: formBody.toString()
        });

        const xmlResult = await response.text();
        console.log("OCA IngresoORMultiplesRetiros response:", xmlResult);

        const parsed = await parseStringPromise(xmlResult, {
            explicitArray: false,
            ignoreAttrs: false,
            tagNameProcessors: [(name) => name.replace(/.*:/, "")]
        });

        // Legacy error format (auth failures, structural errors)
        const findLegacyError = (obj: any): string | null => {
            if (!obj || typeof obj !== "object") return null;
            if (obj.Descripcion) return String(obj.Descripcion);
            for (const key in obj) {
                if (key === "_") continue;
                const found = findLegacyError(obj[key]);
                if (found) return found;
            }
            return null;
        };
        const legacyError = findLegacyError(parsed);
        if (legacyError && legacyError !== "[object Object]") {
            console.error("OCA error:", legacyError);
            return NextResponse.json({ error: `OCA: ${legacyError}` }, { status: 400 });
        }

        // IngresoORMultiplesRetiros response format
        const resumen = parsed?.DataSet?.diffgram?.Resultado?.Resumen;
        const ingresados = Number(resumen?.CantidadIngresados ?? 0);
        const rechazados = Number(resumen?.CantidadRechazados ?? 0);

        if (rechazados > 0 && ingresados === 0) {
            const det = parsed?.DataSet?.diffgram?.Resultado?.DetalleRechazos;
            const motivo = Array.isArray(det) ? det[0]?.Motivo : det?.Motivo;
            console.error("OCA rechazó el envío:", motivo);
            return NextResponse.json({ error: `OCA rechazó el envío: ${motivo || "Sin motivo"}` }, { status: 400 });
        }

        const codigoOperacion = resumen?.CodigoOperacion;
        const detalleIngresos = parsed?.DataSet?.diffgram?.Resultado?.DetalleIngresos;
        const ordenRetiro = Array.isArray(detalleIngresos)
            ? detalleIngresos[0]?.OrdenRetiro
            : detalleIngresos?.OrdenRetiro;

        const nroOR = ordenRetiro || codigoOperacion || null;
        console.log("OCA nroOR:", nroOR, "| CodigoOperacion:", codigoOperacion, "| OrdenRetiro:", ordenRetiro);

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
