import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const nroOR = searchParams.get("nroOR");
        const adminId = searchParams.get("adminId");

        if (!nroOR || !adminId) {
            return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
        }

        const admin = await prisma.user.findUnique({ where: { id: adminId } });
        if (!admin || admin.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const settings = await prisma.storeSettings.findUnique({ where: { id: "global" } });
        const operativa = settings?.ocaOperativa;

        if (!operativa) {
            return NextResponse.json({ error: "Configuración OCA incompleta" }, { status: 500 });
        }

        const labelUrl = `http://www1.oca.com.ar/epak_tracking/Oep_TrackEPak.asmx/GetRotulosPorNumeroOr?nroOR=${encodeURIComponent(nroOR)}&Operativa=${encodeURIComponent(operativa)}`;

        console.log("Fetching OCA label from:", labelUrl);

        const response = await fetch(labelUrl, {
            headers: { Accept: "application/pdf,*/*" }
        });

        if (!response.ok) {
            console.error("OCA label fetch failed:", response.status, await response.text());
            return NextResponse.json({ error: "No se pudo obtener el rótulo de OCA" }, { status: 502 });
        }

        const buffer = await response.arrayBuffer();

        return new NextResponse(buffer, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="rotulo-oca-${nroOR}.pdf"`,
                "Cache-Control": "no-store"
            }
        });

    } catch (error: any) {
        console.error("Label download error:", error);
        return NextResponse.json({ error: "Error al obtener rótulo: " + error.message }, { status: 500 });
    }
}
