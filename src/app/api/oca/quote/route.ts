import { NextResponse } from "next/server";
import { parseStringPromise } from "xml2js";

export async function POST(req: Request) {
    try {
        const { destinationZipCode, weight, volume, packagesCount } = await req.json();

        const cuit = process.env.OCA_CUIT;
        const operativa = process.env.OCA_OPERATIVA;
        const originZipCode = process.env.OCA_ORIGIN_CP;

        if (!cuit || !operativa || !originZipCode) {
            return NextResponse.json({ error: "Configuración de OCA incompleta" }, { status: 500 });
        }

        // SOAP URL for Tariff
        const url = `http://webservice.oca.com.ar/ePak_tracking/Oep_TrackEPak.asmx/Tarifar_Envio_Corporativo?CUIT=${cuit}&Operativa=${operativa}&PesoTotal=${weight}&VolumenTotal=${volume}&CodigoPostalOrigen=${originZipCode}&CodigoPostalDestino=${destinationZipCode}&CantidadPaquetes=${packagesCount || 1}&ValorDeclarado=0`;

        const response = await fetch(url);
        const xmlData = await response.text();
        
        const result = await parseStringPromise(xmlData);
        
        // Structure of OCA XML response for Tarifar_Envio_Corporativo usually comes in a DataSet
        const table = result?.DataSet?.diffgram?.[0]?.NewDataSet?.[0]?.Table?.[0];

        if (!table) {
            return NextResponse.json({ error: "No se pudo obtener cotización de OCA" }, { status: 400 });
        }

        return NextResponse.json({
            price: parseFloat(table.Precio?.[0] || "0"),
            deliveryDays: parseInt(table.PlazoEntrega?.[0] || "0"),
            method: "OCA a Domicilio"
        });

    } catch (error) {
        console.error("OCA Quote Error:", error);
        return NextResponse.json({ error: "Error interno al cotizar con OCA" }, { status: 500 });
    }
}
