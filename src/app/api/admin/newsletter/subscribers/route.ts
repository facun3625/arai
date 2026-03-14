import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        // Defensive access in case singleton hasn't reloaded
        const subscriberModel = (prisma as any).subscriber || (prisma as any).Subscriber;

        if (!subscriberModel) {
            return NextResponse.json({ error: "Modelo no cargado" }, { status: 500 });
        }

        const subscribers = await subscriberModel.findMany({
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(subscribers);
    } catch (error: any) {
        console.error("Error fetching subscribers:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
