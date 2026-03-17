import { NextResponse } from "next/server";
import { parseStringPromise } from "xml2js";

export async function POST(req: Request) {
    try {
        const { destinationZipCode, weight, volume, packagesCount } = await req.json();

        // OCA usually expects CUIT as XX-XXXXXXXX-X
        let cuit = process.env.OCA_CUIT?.replace(/-/g, "");
        if (cuit && cuit.length === 11) {
            cuit = `${cuit.slice(0, 2)}-${cuit.slice(2, 10)}-${cuit.slice(10)}`;
        }
        const operativa = process.env.OCA_OPERATIVA;
        const originZipCode = process.env.OCA_ORIGIN_CP;

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

        const price = parseFloat(table.Total || table.Precio || "0");
        const deliveryDays = parseInt(table.PlazoEntrega || "0");

        return NextResponse.json({
            price: price,
            deliveryDays: deliveryDays,
            method: "OCA a Domicilio"
        });

    } catch (error) {
        console.error("OCA Quote Error:", error);
        return NextResponse.json({ error: "Error interno al cotizar con OCA" }, { status: 500 });
    }
}
