import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resend, EMAIL_FROM } from "@/lib/mail";
import { MarketingTemplate } from "@/components/emails/MarketingTemplate";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { subject, content, buttonText, buttonUrl, adminId, audience = "ALL" } = body;

        // 1. Verify admin
        if (!adminId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const admin = await prisma.user.findUnique({
            where: { id: adminId }
        });

        if (!admin || admin.role !== 'ADMIN') {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // 2. Fetch emails based on audience
        let targetEmails: string[] = [];

        if (audience === "ALL") {
            const subscribers = await prisma.subscriber.findMany({
                where: { isActive: true },
                select: { email: true }
            });
            const users = await prisma.user.findMany({
                select: { email: true }
            });
            targetEmails = Array.from(new Set([
                ...subscribers.map(s => s.email.toLowerCase()),
                ...users.map(u => u.email.toLowerCase())
            ]));
        } else if (audience === "ABANDONED_CART") {
            const abandoned = await prisma.abandonedCart.findMany({
                where: { email: { not: null } },
                select: { email: true }
            });
            targetEmails = Array.from(new Set(
                abandoned.map(a => a.email!.toLowerCase())
            ));
        } else if (audience === "CUSTOMERS") {
            const customers = await prisma.user.findMany({
                where: {
                    orders: {
                        some: {
                            status: { not: "CANCELLED" }
                        }
                    }
                },
                select: { email: true }
            });
            targetEmails = customers.map(c => c.email.toLowerCase());
        } else if (audience === "REGISTERED") {
            const registered = await prisma.user.findMany({
                select: { email: true }
            });
            targetEmails = registered.map(r => r.email.toLowerCase());
        } else if (audience === "CUSTOM_LIST" && body.customEmails) {
            // customEmails should be an array of strings
            targetEmails = Array.from(new Set(
                body.customEmails.map((e: string) => e.trim().toLowerCase()).filter((e: string) => e.includes("@"))
            ));
        }

        if (targetEmails.length === 0) {
            return NextResponse.json({ error: "No se encontraron destinatarios para esta audiencia" }, { status: 400 });
        }

        // 3. Send emails in batches using Resend Batch API
        // For production, if there are thousands, this should be a background job
        const batchSize = 100;
        const batches = [];

        for (let i = 0; i < targetEmails.length; i += batchSize) {
            batches.push(targetEmails.slice(i, i + batchSize));
        }

        let sentCount = 0;
        for (const batch of batches) {
            const batchData = batch.map(email => ({
                from: EMAIL_FROM,
                to: email,
                subject: subject,
                react: MarketingTemplate({
                    subject: subject,
                    content: content,
                    buttonText: buttonText,
                    buttonUrl: buttonUrl
                })
            }));

            const { data, error } = await resend.batch.send(batchData);
            if (!error) sentCount += batch.length;
            console.log(`DEBUG: Batch sent. Count: ${sentCount}`);
        }

        return NextResponse.json({
            success: true,
            message: `Campania enviada con éxito a ${sentCount} suscriptores.`,
            count: sentCount
        });

    } catch (error: any) {
        console.error("DEBUG: Failed to send mass email", error);
        return NextResponse.json({ error: "Internal Server Error: " + error.message }, { status: 500 });
    }
}
