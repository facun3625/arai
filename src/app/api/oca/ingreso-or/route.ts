import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseStringPromise } from "xml2js";

function escapeXml(str: string): string {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
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

        const totalItems = order.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
        const pesoTotal = Math.max(0.5, totalItems * 0.5).toFixed(3);
        const volumen = (0.000027).toFixed(9);
        const idCentro = addr?.branchId || "0";
        const nroEnvio = orderId.slice(-8).toUpperCase();

        const xmlDatos = `<Datos>
  <Origen NroCliente="${escapeXml(nroCliente)}" Operativa="${escapeXml(operativa)}" />
  <Envio NroEnvio="${nroEnvio}" PesoTotal="${pesoTotal}" VolumenTotal="${volumen}" CantidadPaquetes="1" Valor="${Math.round(order.total)}" COD="0" Calle="${escapeXml(addr?.street || "")}" Numero="${escapeXml(addr?.number || "")}" Piso="${escapeXml(addr?.apartment || "")}" Depto="" Localidad="${escapeXml(addr?.city || "")}" Provincia="${escapeXml(addr?.province || "")}" CodigoPostal="${addr?.zipCode || ""}" Telefono="${order.contactPhone || ""}" Email="${order.contactEmail || ""}" IdCentroImposicionDestino="${idCentro}">
    <Paquetes>
      <Paquete Alto="15" Ancho="15" Largo="15" Peso="${pesoTotal}" Valor="${Math.round(order.total)}" />
    </Paquetes>
    <Destinatario NroDoc="${order.contactDni || ""}" Tipo="DNI" Nombre="${escapeXml(order.contactName || "")}" Apellido="${escapeXml(order.contactLastName || "")}" />
  </Envio>
</Datos>`;

        const soapBody = `<?xml version="1.0" encoding="utf-8"?>
<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
  <soap12:Body>
    <IngresoOR xmlns="http://webservice.oca.com.ar/ePak_tracking/">
      <usr>${escapeXml(usr)}</usr>
      <psw>${escapeXml(psw)}</psw>
      <xmlDatos><![CDATA[${xmlDatos}]]></xmlDatos>
    </IngresoOR>
  </soap12:Body>
</soap12:Envelope>`;

        console.log("OCA IngresoOR request XML:", xmlDatos);

        const response = await fetch("http://webservice.oca.com.ar/ePak_tracking/Oep_TrackEPak.asmx", {
            method: "POST",
            headers: {
                "Content-Type": "application/soap+xml; charset=utf-8",
                "SOAPAction": "http://webservice.oca.com.ar/ePak_tracking/IngresoOR"
            },
            body: soapBody
        });

        const xmlResult = await response.text();
        console.log("OCA IngresoOR response:", xmlResult);

        const parsed = await parseStringPromise(xmlResult, {
            explicitArray: false,
            ignoreAttrs: true,
            tagNameProcessors: [(name) => name.replace(/.*:/, "")]
        });

        const findResult = (obj: any): string | null => {
            if (!obj || typeof obj !== "object") return null;
            if (obj.IngresoORResult !== undefined) return String(obj.IngresoORResult);
            for (const key in obj) {
                const found = findResult(obj[key]);
                if (found !== null) return found;
            }
            return null;
        };

        const nroOR = findResult(parsed);
        console.log("OCA nroOR result:", nroOR);

        if (!nroOR || nroOR.toUpperCase().startsWith("ERROR") || nroOR === "0" || isNaN(Number(nroOR))) {
            return NextResponse.json({
                error: `OCA rechazó el ingreso: ${nroOR || "Sin respuesta del servidor"}`
            }, { status: 400 });
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
