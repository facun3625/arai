import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const localPrisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email || !email.includes("@")) {
            return NextResponse.json(
                { error: "Email inválido" },
                { status: 400 }
            );
        }

        // Defensive access to the model on local instance
        const subscriberModel = (localPrisma as any).subscriber || (localPrisma as any).Subscriber;

        if (!subscriberModel) {
            const availableModels = Object.keys(localPrisma).filter(k => !k.startsWith('$') && !k.startsWith('_'));
            console.error("Local Prisma subscriber model not found. Available models:", availableModels);
            return NextResponse.json(
                { error: `[REFRESHED-V2] Error: Modelo 'subscriber' no encontrado. Modelos disponibles: ${availableModels.join(', ')}` },
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
