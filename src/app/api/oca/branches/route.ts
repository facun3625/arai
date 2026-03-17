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
        // Try CodigoPostal instead of idCodigoPostal which often causes 500
        let url = `http://webservice.oca.com.ar/ePak_tracking/Oep_TrackEPak.asmx/GetCentrosImposicionConServiciosByCP?CodigoPostal=${zipCode}`;

        console.log("OCA Branches Request URL (Primary):", url);

        let response = await fetch(url);
        
        if (!response.ok) {
            console.warn("Primary branches endpoint failed, trying fallback...");
            // Fallback to a simpler endpoint
            url = `http://webservice.oca.com.ar/ePak_tracking/Oep_TrackEPak.asmx/GetCentrosImposicion?ZipCode=${zipCode}`;
            console.log("OCA Branches Request URL (Fallback):", url);
            response = await fetch(url);
        }

        if (!response.ok) {
            console.error("All OCA Branches endpoints failed:", response.status);
            return NextResponse.json({ branches: [] });
        }
        const xmlData = await response.text();
        
        // Use tagNameProcessors to strip prefixes for easier access
        const result = await parseStringPromise(xmlData, { 
            explicitArray: false, 
            ignoreAttrs: true,
            tagNameProcessors: [(name) => name.replace(/.*:/, '')]
        });
        
        let centers = result?.DataSet?.diffgram?.NewDataSet?.Table 
                   || result?.DataSet?.Table 
                   || result?.DataSet?.diffgram?.Table
                   || result?.CentrosDeImposicion?.Centro;

        if (!centers) {
            // Recursive search for Table or Centro
            const findData = (obj: any): any => {
                if (!obj || typeof obj !== 'object') return null;
                if (obj.Table) return obj.Table;
                if (obj.Centro) return obj.Centro;
                for (const key in obj) {
                    const found = findData(obj[key]);
                    if (found) return found;
                }
                return null;
            };
            centers = findData(result);
        }

        if (!centers) {
            console.warn("No centers found in branches response. Struct:", JSON.stringify(result, null, 2));
            return NextResponse.json({ branches: [] });
        }

        if (!Array.isArray(centers)) {
            centers = [centers];
        }

        const formattedBranches = centers.map((c: any) => ({
            id: c.IdCentroImposicion || c.idCentroImposicion,
            name: c.Sigla || c.Nombre,
            address: `${c.Calle} ${c.Numero}`,
            city: c.Localidad,
            zipCode: c.CodigoPostal
        }));

        return NextResponse.json({ branches: formattedBranches });

    } catch (error) {
        console.error("OCA Branches Error:", error);
        return NextResponse.json({ error: "Error al obtener sucursales OCA" }, { status: 500 });
    }
}
