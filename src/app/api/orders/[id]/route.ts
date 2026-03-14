import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: orderId } = await params;

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                items: true
            }
        });

        if (!order) {
            return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
        }

        return NextResponse.json({ order });

    } catch (error: any) {
        console.error('Fetch order detail error:', error);
        return NextResponse.json({ error: 'Error interno al obtener el pedido' }, { status: 500 });
    }
}
