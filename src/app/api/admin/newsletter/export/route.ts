import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        // Defensive access to the model
        const subscriberModel = (prisma as any).subscriber || (prisma as any).Subscriber;

        if (!subscriberModel) {
            return NextResponse.json({ error: "Modelo no cargado" }, { status: 500 });
        }

        const subscribers = await subscriberModel.findMany({
            orderBy: { createdAt: "desc" },
        });

        const csvRows = [
            ["ID", "Email", "Activo", "Fecha Suscripción"],
            ...subscribers.map((s: any) => [
                s.id,
                s.email,
                s.isActive ? "Sí" : "No",
                s.createdAt instanceof Date ? s.createdAt.toISOString() : String(s.createdAt),
            ]),
        ];

        const csvContent = csvRows.map((row) => row.join(",")).join("\n");

        const response = new NextResponse(csvContent);
        response.headers.set("Content-Type", "text/csv");
        response.headers.set("Content-Disposition", "attachment; filename=suscriptores-arai.csv");

        return response;
    } catch (error) {
        console.error("Export error:", error);
        return NextResponse.json(
            { error: "Error al exportar suscriptores" },
            { status: 500 }
        );
    }
}
