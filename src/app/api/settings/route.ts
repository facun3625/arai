import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
        let settings = await prisma.storeSettings.findUnique({
            where: { id: "global" }
        });

        // Initialize defaults if they don't exist yet
        if (!settings) {
            settings = await prisma.storeSettings.create({
                data: {
                    id: "global",
                    freeShippingThreshold: 0,
                    bankTransferDiscount: 15,
                    pointsEnabled: false,
                    pointsRatio: 0.01,
                    instagramUrl: "",
                    facebookUrl: "",
                    xUrl: "",
                    youtubeUrl: "",
                    tiktokUrl: "",
                    whatsappNumber: ""
                }
            });
        }

        return NextResponse.json(settings);
    } catch (error) {
        console.error("Error fetching settings:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const settings = await prisma.storeSettings.upsert({
            where: { id: "global" },
            update: {
                freeShippingThreshold: Number(body.freeShippingThreshold) || 0,
                bankTransferDiscount: Number(body.bankTransferDiscount) || 0,
                pointsEnabled: body.pointsEnabled ?? false,
                pointsRatio: Number(body.pointsRatio) || 0,
                instagramUrl: body.instagramUrl ?? "",
                facebookUrl: body.facebookUrl ?? "",
                xUrl: body.xUrl ?? "",
                youtubeUrl: body.youtubeUrl ?? "",
                tiktokUrl: body.tiktokUrl ?? "",
                whatsappNumber: body.whatsappNumber ?? "",
            },
            create: {
                id: "global",
                freeShippingThreshold: Number(body.freeShippingThreshold) || 0,
                bankTransferDiscount: Number(body.bankTransferDiscount) || 15,
                pointsEnabled: body.pointsEnabled ?? false,
                pointsRatio: Number(body.pointsRatio) || 0.01,
                instagramUrl: body.instagramUrl ?? "",
                facebookUrl: body.facebookUrl ?? "",
                xUrl: body.xUrl ?? "",
                youtubeUrl: body.youtubeUrl ?? "",
                tiktokUrl: body.tiktokUrl ?? "",
                whatsappNumber: body.whatsappNumber ?? "",
            }
        });

        return NextResponse.json(settings);
    } catch (error) {
        console.error("Error updating settings:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
