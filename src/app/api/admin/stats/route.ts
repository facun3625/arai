import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay, eachDayOfInterval, format, parseISO } from "date-fns";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const fromStr = searchParams.get("from");
        const toStr = searchParams.get("to");

        if (!fromStr || !toStr) {
            return NextResponse.json({ error: "Missing date range" }, { status: 400 });
        }

        const from = startOfDay(parseISO(fromStr));
        const to = endOfDay(parseISO(toStr));

        // 1. Basic Metrics in Range
        const ordersInRange = await prisma.order.findMany({
            where: {
                createdAt: { gte: from, lte: to },
                status: "COMPLETED"
            },
            include: {
                items: true
            }
        });

        const totalRevenue = ordersInRange.reduce((acc, order) => acc + order.total, 0);
        const totalOrders = ordersInRange.length;
        const avgTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // 2. Revenue over time (Daily)
        const days = eachDayOfInterval({ start: from, end: to });
        const revenueOverTime = days.map(day => {
            const dayStr = format(day, 'yyyy-MM-dd');
            const dayRevenue = ordersInRange
                .filter(order => format(order.createdAt, 'yyyy-MM-dd') === dayStr)
                .reduce((acc, order) => acc + order.total, 0);
            return { date: dayStr, label: format(day, 'dd/MM'), revenue: dayRevenue };
        });

        // 3. Top Products by Revenue
        const productSales: Record<string, { name: string; revenue: number; quantity: number; image?: string }> = {};
        
        ordersInRange.forEach(order => {
            order.items.forEach(item => {
                if (!productSales[item.productId]) {
                    productSales[item.productId] = { 
                        name: item.name, 
                        revenue: 0, 
                        quantity: 0,
                        image: item.image || undefined
                    };
                }
                productSales[item.productId].revenue += item.price * item.quantity;
                productSales[item.productId].quantity += item.quantity;
            });
        });

        const topProducts = Object.values(productSales)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 10);

        // 4. Category Distribution
        // This is a bit more complex because items don't have categoryId directly
        // We need to fetch products mentioned in items
        const productIds = Object.keys(productSales);
        const productsWithCategories = await prisma.product.findMany({
            where: { id: { in: productIds } },
            select: { id: true, categories: { select: { name: true } } }
        });

        const categorySales: Record<string, number> = {};
        ordersInRange.forEach(order => {
            order.items.forEach(item => {
                const product = productsWithCategories.find(p => p.id === item.productId);
                const categoryName = product?.categories[0]?.name || "Sin Categoría";
                categorySales[categoryName] = (categorySales[categoryName] || 0) + (item.price * item.quantity);
            });
        });

        const categorySplit = Object.entries(categorySales)
            .map(([name, revenue]) => ({ name, revenue }))
            .sort((a, b) => b.revenue - a.revenue);

        // 5. User Growth
        const newUsersCount = await prisma.user.count({
            where: { createdAt: { gte: from, lte: to } }
        });

        // 6. Abandoned Carts in range
        const abandonedCartsCount = await prisma.abandonedCart.count({
            where: { createdAt: { gte: from, lte: to } }
        });

        return NextResponse.json({
            totalRevenue,
            totalOrders,
            avgTicket,
            revenueOverTime,
            topProducts,
            categorySplit,
            newUsersCount,
            abandonedCartsCount
        });
    } catch (error) {
        console.error("Error fetching advanced stats:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
