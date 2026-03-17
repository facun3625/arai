import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        // We aggregate OrderItems to find the top selling products
        const topSellers = await prisma.orderItem.groupBy({
            by: ['productId'],
            _sum: {
                quantity: true
            },
            orderBy: {
                _sum: {
                    quantity: 'desc'
                }
            },
            take: 10
        });

        const productIds = topSellers.map(item => item.productId);

        // Fetch the full product details for these top sellers
        const products = await prisma.product.findMany({
            where: {
                id: {
                    in: productIds
                }
            },
            include: {
                categories: true,
                variants: true
            }
        });

        // Sort them according to their sales rank
        const sortedProducts = productIds.map(id => products.find(p => p.id === id)).filter(Boolean);

        // If we don't have enough sales yet, fill with most recent products
        if (sortedProducts.length < 10) {
            const recentProducts = await prisma.product.findMany({
                where: {
                    id: {
                        notIn: productIds
                    }
                },
                include: {
                    categories: true,
                    variants: true
                },
                orderBy: {
                    createdAt: 'desc'
                },
                take: 10 - sortedProducts.length
            });
            return NextResponse.json([...sortedProducts, ...recentProducts]);
        }

        return NextResponse.json(sortedProducts);
    } catch (error: any) {
        console.error("GET TOP SELLERS ERROR:", error);
        return NextResponse.json({
            error: "Error al obtener productos destacados: " + error.message
        }, { status: 500 });
    }
}
