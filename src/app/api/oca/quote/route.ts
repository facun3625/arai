import { NextResponse } from "next/server";
import { parseStringPromise } from "xml2js";
import { prisma } from "@/lib/prisma";

const DEFAULT_DIM_CM = 20;
const DEFAULT_WEIGHT_KG = 1;

// Mirrors how /api/orders resolves each item's real weight/dimensions (variant falls back to
// product) so the quote reflects what's actually in the cart instead of a fixed placeholder box.
async function resolveWeightAndVolume(items: { productId: string; variantId?: string; quantity: number }[]) {
    let totalWeight = 0;
    let totalVolume = 0;

    for (const item of items) {
        let weight: number | null = null;
        let width: number | null = null;
        let height: number | null = null;
        let length: number | null = null;

        if (item.variantId) {
            const variant = await prisma.variant.findUnique({ where: { id: item.variantId } });
            if (variant) {
                weight = variant.weight;
                width = variant.width;
                height = variant.height;
                length = variant.length;
            }
        }
        if (weight == null || width == null || height == null || length == null) {
            const product = await prisma.product.findUnique({ where: { id: item.productId } });
            if (product) {
                weight = weight ?? product.weight;
                width = width ?? product.width;
                height = height ?? product.height;
                length = length ?? product.length;
            }
        }

        const itemWeightKg = weight ?? DEFAULT_WEIGHT_KG;
        const itemVolumeM3 = ((width ?? DEFAULT_DIM_CM) * (height ?? DEFAULT_DIM_CM) * (length ?? DEFAULT_DIM_CM)) / 1_000_000;

        totalWeight += itemWeightKg * item.quantity;
        totalVolume += itemVolumeM3 * item.quantity;
    }

    return { totalWeight, totalVolume };
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { destinationZipCode, packagesCount, isBranch, items } = body;
        let { weight, volume } = body;

        if (Array.isArray(items) && items.length > 0) {
            const resolved = await resolveWeightAndVolume(items);
            weight = resolved.totalWeight;
            volume = resolved.totalVolume;
        }

        // Get settings from DB
        const settings = await prisma.storeSettings.findUnique({
            where: { id: "global" }
        });

        // Check if OCA is enabled
        if (settings && settings.ocaEnabled === false) {
            return NextResponse.json({ error: "El servicio de OCA se encuentra deshabilitado temporalmente." }, { status: 403 });
        }

        // OCA usually expects CUIT as XX-XXXXXXXX-X
        let cuit = settings?.ocaCuit?.replace(/-/g, "") || process.env.OCA_CUIT?.replace(/-/g, "");
        if (cuit && cuit.length === 11) {
            cuit = `${cuit.slice(0, 2)}-${cuit.slice(2, 10)}-${cuit.slice(10)}`;
        }

        // Use sucursal operativa if isBranch is true
        const operativa = isBranch 
            ? (settings?.ocaOperativaSucursal || process.env.OCA_OPERATIVA_SUCURSAL || settings?.ocaOperativa || process.env.OCA_OPERATIVA)
            : (settings?.ocaOperativa || process.env.OCA_OPERATIVA);
            
        const originZipCode = settings?.ocaOriginZipCode || process.env.OCA_ORIGIN_CP;

        if (!cuit || !operativa || !originZipCode) {
            return NextResponse.json({ error: "Configuración de OCA incompleta" }, { status: 500 });
        }

        // SOAP URL for Tariff
        const url = `http://webservice.oca.com.ar/ePak_tracking/Oep_TrackEPak.asmx/Tarifar_Envio_Corporativo?CUIT=${cuit}&Operativa=${operativa}&PesoTotal=${weight}&VolumenTotal=${volume}&CodigoPostalOrigen=${originZipCode}&CodigoPostalDestino=${destinationZipCode}&CantidadPaquetes=${packagesCount || 1}&ValorDeclarado=0`;

        console.log("OCA Quote Request URL:", url);

        const response = await fetch(url);
        if (!response.ok) {
            console.error("OCA API HTTP Error:", response.status, await response.text());
            return NextResponse.json({ error: "OCA no respondió correctamente" }, { status: 502 });
        }
        const xmlData = await response.text();
        console.log("RAW OCA XML Response:", xmlData);
        
        // Use tagNameProcessors to strip prefixes for easier access
        const result = await parseStringPromise(xmlData, { 
            explicitArray: false, 
            ignoreAttrs: true,
            tagNameProcessors: [(name) => name.replace(/.*:/, '')]
        });
        
        console.log("Parsed OCA Result:", JSON.stringify(result, null, 2));
        
        // With prefixes stripped, access is much simpler
        let table = result?.DataSet?.diffgram?.NewDataSet?.Table 
                 || result?.DataSet?.Table 
                 || result?.DataSet?.diffgram?.Table;

        if (!table) {
            // Last resort: search recursively for Table
            const findTable = (obj: any): any => {
                if (!obj || typeof obj !== 'object') return null;
                if (obj.Table) return obj.Table;
                for (const key in obj) {
                    const found = findTable(obj[key]);
                    if (found) return found;
                }
                return null;
            };
            table = findTable(result);
        }

        if (!table || table.Error) {
            console.error("OCA Validation Error:", table?.Error || "No Table found");
            return NextResponse.json({ error: table?.Error || "No se pudo obtener cotización de OCA" }, { status: 400 });
        }

        // OCA's tariff comes back without IVA — add the 21% here, once, so every
        // consumer of this quote (domicilio, sucursal discount, final charge) is consistent.
        // priceBeforeTax/iva are kept separate so the UI can show the breakdown to the customer.
        const priceBeforeTax = parseFloat(table.Total || table.Precio || "0");
        const iva = priceBeforeTax * 0.21;
        const price = priceBeforeTax + iva;
        const deliveryDays = parseInt(table.PlazoEntrega || "0");

        return NextResponse.json({
            price: price,
            priceBeforeTax: priceBeforeTax,
            iva: iva,
            deliveryDays: deliveryDays,
            method: "OCA a Domicilio"
        });

    } catch (error) {
        console.error("OCA Quote Error:", error);
        return NextResponse.json({ error: "Error interno al cotizar con OCA" }, { status: 500 });
    }
}
