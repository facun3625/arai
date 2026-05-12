import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { subDays } from "date-fns";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const secret = request.headers.get("x-cron-secret");
    if (secret !== process.env.CRON_SECRET) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cutoff = subDays(new Date(), 4);

    const result = await prisma.order.updateMany({
        where: {
            status: "SHIPPED",
            updatedAt: { lte: cutoff }
        },
        data: { status: "COMPLETED" }
    });

    console.log(`[cron] auto-complete-orders: ${result.count} pedidos completados automáticamente`);

    return NextResponse.json({ completed: result.count });
}
