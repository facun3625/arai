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
                    whatsappNumber: "",
                    mercadopagoPublicKey: "",
                    mercadopagoAccessToken: "",
                    mercadopagoEnabled: true,
                    bankTransferCbu: "",
                    bankTransferAlias: "",
                    ocaCuit: "",
                    ocaOperativa: "",
                    ocaOperativaSucursal: "",
                    ocaOriginZipCode: "",
                    ocaEnabled: true,
                    maintenanceMode: false
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

        console.log("Saving settings with body:", body);

        // Helper to parse values safely
        const parseNum = (val: any) => {
            if (val === null || val === undefined) return undefined;
            const num = Number(val);
            return isNaN(num) ? undefined : num;
        };

        const parseStr = (val: any) => {
            if (val === null) return null;
            if (val === undefined) return undefined;
            return String(val);
        };

        const updateData: any = {
            ...(body.freeShippingThreshold !== undefined && { freeShippingThreshold: parseNum(body.freeShippingThreshold) }),
            ...(body.bankTransferDiscount !== undefined && { bankTransferDiscount: parseNum(body.bankTransferDiscount) }),
            ...(body.bankTransferCbu !== undefined && { bankTransferCbu: parseStr(body.bankTransferCbu) }),
            ...(body.bankTransferAlias !== undefined && { bankTransferAlias: parseStr(body.bankTransferAlias) }),
            ...(body.pointsEnabled !== undefined && { pointsEnabled: !!body.pointsEnabled }),
            ...(body.pointsRatio !== undefined && { pointsRatio: parseNum(body.pointsRatio) }),
            ...(body.instagramUrl !== undefined && { instagramUrl: parseStr(body.instagramUrl) }),
            ...(body.facebookUrl !== undefined && { facebookUrl: parseStr(body.facebookUrl) }),
            ...(body.xUrl !== undefined && { xUrl: parseStr(body.xUrl) }),
            ...(body.youtubeUrl !== undefined && { youtubeUrl: parseStr(body.youtubeUrl) }),
            ...(body.tiktokUrl !== undefined && { tiktokUrl: parseStr(body.tiktokUrl) }),
            ...(body.whatsappNumber !== undefined && { whatsappNumber: parseStr(body.whatsappNumber) }),
            ...(body.mercadopagoPublicKey !== undefined && { mercadopagoPublicKey: parseStr(body.mercadopagoPublicKey) }),
            ...(body.mercadopagoAccessToken !== undefined && { mercadopagoAccessToken: parseStr(body.mercadopagoAccessToken) }),
            ...(body.mercadopagoEnabled !== undefined && { mercadopagoEnabled: !!body.mercadopagoEnabled }),
            ...(body.modoPublicKey !== undefined && { modoPublicKey: parseStr(body.modoPublicKey) }),
            ...(body.modoPrivateKey !== undefined && { modoPrivateKey: parseStr(body.modoPrivateKey) }),
            ...(body.modoMerchantId !== undefined && { modoMerchantId: parseStr(body.modoMerchantId) }),
            ...(body.modoEnabled !== undefined && { modoEnabled: !!body.modoEnabled }),
            ...(body.paypalClientId !== undefined && { paypalClientId: parseStr(body.paypalClientId) }),
            ...(body.paypalSecret !== undefined && { paypalSecret: parseStr(body.paypalSecret) }),
            ...(body.paypalEnabled !== undefined && { paypalEnabled: !!body.paypalEnabled }),
            ...(body.dhlAccountNumber !== undefined && { dhlAccountNumber: parseStr(body.dhlAccountNumber) }),
            ...(body.dhlApiKey !== undefined && { dhlApiKey: parseStr(body.dhlApiKey) }),
            ...(body.dhlSiteId !== undefined && { dhlSiteId: parseStr(body.dhlSiteId) }),
            ...(body.dhlEnabled !== undefined && { dhlEnabled: !!body.dhlEnabled }),
            ...(body.ocaCuit !== undefined && { ocaCuit: parseStr(body.ocaCuit) }),
            ...(body.ocaOperativa !== undefined && { ocaOperativa: parseStr(body.ocaOperativa) }),
            ...(body.ocaOperativaSucursal !== undefined && { ocaOperativaSucursal: parseStr(body.ocaOperativaSucursal) }),
            ...(body.ocaOriginZipCode !== undefined && { ocaOriginZipCode: parseStr(body.ocaOriginZipCode) }),
            ...(body.ocaEnabled !== undefined && { ocaEnabled: !!body.ocaEnabled }),
            ...(body.maintenanceMode !== undefined && { maintenanceMode: !!body.maintenanceMode }),
        };

        // Remove undefined keys to avoid Prisma errors
        Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

        let settings;
        const exists = await prisma.storeSettings.findUnique({ where: { id: "global" } });

        if (exists) {
            settings = await prisma.storeSettings.update({
                where: { id: "global" },
                data: updateData
            });
        } else {
            settings = await prisma.storeSettings.create({
                data: {
                    id: "global",
                    ...updateData,
                    // Fill required fields with defaults if they were missing in updateData
                    freeShippingThreshold: updateData.freeShippingThreshold ?? 0,
                    bankTransferDiscount: updateData.bankTransferDiscount ?? 15,
                    pointsEnabled: updateData.pointsEnabled ?? false,
                    pointsRatio: updateData.pointsRatio ?? 0.01,
                    mercadopagoEnabled: updateData.mercadopagoEnabled ?? true,
                    ocaEnabled: updateData.ocaEnabled ?? true,
                    maintenanceMode: updateData.maintenanceMode ?? false,
                }
            });
        }

        return NextResponse.json(settings);
    } catch (error: any) {
        console.error("CRITICAL ERROR updating settings:", error);
        return NextResponse.json({ 
            error: "Internal Server Error", 
            details: error.message 
        }, { status: 500 });
    }
}
