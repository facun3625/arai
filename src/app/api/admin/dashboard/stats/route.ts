import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth, subMonths } from "date-fns";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
        const now = new Date();
        const startOfCurrentMonth = startOfMonth(now);
        const startOfLastMonth = startOfMonth(subMonths(now, 1));
        const endOfLastMonth = endOfMonth(subMonths(now, 1));

        // 1. Total Revenue (Completed orders)
        const totalRevenueResult = await prisma.order.aggregate({
            _sum: { total: true },
            where: { status: "COMPLETED" }
        });
        const totalRevenue = totalRevenueResult._sum.total || 0;

        // 2. Revenue Current Month
        const currentMonthRevenueResult = await prisma.order.aggregate({
            _sum: { total: true },
            where: { 
                status: "COMPLETED",
                createdAt: { gte: startOfCurrentMonth }
            }
        });
        const currentMonthRevenue = currentMonthRevenueResult._sum.total || 0;

        // 3. Revenue Last Month (for trend)
        const lastMonthRevenueResult = await prisma.order.aggregate({
            _sum: { total: true },
            where: { 
                status: "COMPLETED",
                createdAt: { gte: startOfLastMonth, lte: endOfLastMonth }
            }
        });
        const lastMonthRevenue = lastMonthRevenueResult._sum.total || 0;

        // Trend calculation
        let revenueTrend = 0;
        if (lastMonthRevenue > 0) {
            revenueTrend = ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
        }

        // 4. Order Status Counts
        const ordersByStatus = await prisma.order.groupBy({
            by: ['status'],
            _count: { id: true }
        });

        // 5. Total Products
        const totalProducts = await prisma.product.count();

        // 6. New Users (Last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const newUsers = await prisma.user.count({
            where: { createdAt: { gte: thirtyDaysAgo } }
        });

        // 7. Recent Activity (Last 5 orders)
        const recentOrders = await prisma.order.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                contactName: true,
                contactLastName: true,
                total: true,
                status: true,
                createdAt: true
            }
        });

        // 8. Conversion Rate (Rough estimate: Orders / Abandoned Carts + Orders)
        const totalOrdersCount = await prisma.order.count();
        const abandonedCartsCount = await prisma.abandonedCart.count();
        const totalInteractions = totalOrdersCount + abandonedCartsCount;
        const conversionRate = totalInteractions > 0 ? (totalOrdersCount / totalInteractions) * 100 : 0;

        return NextResponse.json({
            totalRevenue,
            currentMonthRevenue,
            lastMonthRevenue,
            revenueTrend: revenueTrend.toFixed(1),
            ordersByStatus,
            totalProducts,
            newUsers,
            recentOrders,
            conversionRate: conversionRate.toFixed(1),
            abandonedCartsCount
        });
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
