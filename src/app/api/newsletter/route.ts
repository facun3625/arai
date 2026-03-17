import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const subscribers = await prisma.subscriber.findMany({
            where: { isActive: true },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(subscribers);
    } catch (error: any) {
        console.error("DEBUG: Failed to fetch subscribers", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email || !email.includes("@")) {
            return NextResponse.json(
                { error: "Email inválido" },
                { status: 400 }
            );
        }

        const subscriber = await prisma.subscriber.upsert({
            where: { email },
            update: { isActive: true },
            create: { email },
        });

        return NextResponse.json({
            message: "¡Gracias por suscribirte!",
            subscriber,
        });
    } catch (error: any) {
        console.error("Newsletter error:", error);
        return NextResponse.json(
            { error: `Error: ${error.message || "Error al procesar la suscripción"}` },
            { status: 500 }
        );
    }
}
