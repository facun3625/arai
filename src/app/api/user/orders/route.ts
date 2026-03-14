import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'ID de usuario requerido' }, { status: 400 });
        }

        const orders = await prisma.order.findMany({
            where: { userId },
            include: {
                items: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json({ orders });

    } catch (error: any) {
        console.error('Fetch orders error:', error);
        return NextResponse.json({ error: 'Error interno al obtener los pedidos' }, { status: 500 });
    }
}
