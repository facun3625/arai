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

        const labelUrl = `https://webservice.oca.com.ar/epak_tracking/Oep_Trackepak.asmx/GetPdfDeEtiquetasPorOrdenOrNumeroEnvio?idOrdenRetiro=${encodeURIComponent(nroOR)}&nroEnvio=&logisticaInversa=false`;

        console.log("Fetching OCA label from:", labelUrl);

        const response = await fetch(labelUrl);

        if (!response.ok) {
            const text = await response.text();
            console.error("OCA label fetch failed:", response.status, text);
            return NextResponse.json({ error: "No se pudo obtener el rótulo de OCA" }, { status: 502 });
        }

        const contentType = response.headers.get("content-type") || "";
        const buffer = await response.arrayBuffer();

        // OCA returns base64-encoded PDF inside XML for this endpoint
        if (contentType.includes("xml") || contentType.includes("text")) {
            const text = new TextDecoder().decode(buffer);
            console.log("OCA label response (text):", text.slice(0, 300));
            const match = text.match(/<[^>]+>([A-Za-z0-9+/=\s]+)<\/[^>]+>/);
            if (match) {
                const pdfBuffer = Buffer.from(match[1].replace(/\s/g, ""), "base64");
                return new NextResponse(pdfBuffer, {
                    headers: {
                        "Content-Type": "application/pdf",
                        "Content-Disposition": `attachment; filename="rotulo-oca-${nroOR}.pdf"`,
                        "Cache-Control": "no-store"
                    }
                });
            }
            return NextResponse.json({ error: "OCA no devolvió PDF válido", raw: text.slice(0, 500) }, { status: 502 });
        }

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
