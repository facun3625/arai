import { NextResponse } from "next/server";
// Refreshing module
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email || !email.includes("@")) {
            return NextResponse.json(
                { error: "Email inválido" },
                { status: 400 }
            );
        }

        // Defensive access to the model
        const subscriberModel = (prisma as any).subscriber || (prisma as any).Subscriber;

        if (!subscriberModel) {
            const availableModels = Object.keys(prisma).filter(k => !k.startsWith('$') && !k.startsWith('_'));
            console.error("Prisma subscriber model not found. Available models:", availableModels);
            return NextResponse.json(
                { error: `Error: Modelo 'subscriber' no encontrado. Modelos disponibles: ${availableModels.join(', ')}` },
                { status: 500 }
            );
        }

        const subscriber = await subscriberModel.upsert({
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
