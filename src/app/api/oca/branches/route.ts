import { NextResponse } from "next/server";
import { parseStringPromise } from "xml2js";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const zipCode = searchParams.get("zipCode");

        if (!zipCode) {
            return NextResponse.json({ error: "Código Postal requerido" }, { status: 400 });
        }

        // URL for Branches with Services by CP
        // Note: OCA API usually uses some variant, let's use GetCentrosImposicionConServiciosByCP
        const url = `http://webservice.oca.com.ar/ePak_tracking/Oep_TrackEPak.asmx/GetCentrosImposicionConServiciosByCP?idCodigoPostal=${zipCode}`;

        const response = await fetch(url);
        const xmlData = await response.text();
        
        const result = await parseStringPromise(xmlData);
        const centers = result?.DataSet?.diffgram?.[0]?.NewDataSet?.[0]?.Table;

        if (!centers || !Array.isArray(centers)) {
            return NextResponse.json({ branches: [] });
        }

        const formattedBranches = centers.map((c: any) => ({
            id: c.IdCentroImposicion?.[0],
            name: c.Descripcion?.[0],
            address: `${c.Calle?.[0]} ${c.Numero?.[0]}`,
            city: c.Localidad?.[0],
            zipCode: c.CodigoPostal?.[0]
        }));

        return NextResponse.json({ branches: formattedBranches });

    } catch (error) {
        console.error("OCA Branches Error:", error);
        return NextResponse.json({ error: "Error al obtener sucursales OCA" }, { status: 500 });
    }
}
