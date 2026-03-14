import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        // Basic CSV generation
        const subscribers = await prisma.subscriber.findMany({
            orderBy: { createdAt: "desc" },
        });

        const csvRows = [
            ["ID", "Email", "Activo", "Fecha Suscripción"],
            ...subscribers.map((s) => [
                s.id,
                s.email,
                s.isActive ? "Sí" : "No",
                s.createdAt.toISOString(),
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
