import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'ID de usuario requerido' }, { status: 400 });
        }

        const addresses = await prisma.address.findMany({
            where: { userId },
            orderBy: { isDefault: 'desc' }
        });

        return NextResponse.json({ addresses });

    } catch (error: any) {
        console.error('Fetch addresses error:', error);
        return NextResponse.json({ error: 'Error interno al obtener direcciones' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { userId, street, number, apartment, city, province, zipCode, phone, dni, isDefault } = await request.json();

        if (!userId || !street || !number || !city || !province || !zipCode) {
            return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
        }

        // If this is set as default, unset others first
        if (isDefault) {
            await prisma.address.updateMany({
                where: { userId },
                data: { isDefault: false }
            });
        }

        const address = await prisma.address.create({
            data: {
                userId,
                street,
                number,
                apartment,
                city,
                province,
                zipCode,
                phone,
                dni,
                isDefault: !!isDefault
            }
        });

        return NextResponse.json({
            address,
            message: 'Dirección guardada exitosamente'
        }, { status: 201 });

    } catch (error: any) {
        console.error('Save address error:', error);
        return NextResponse.json({ error: 'Error interno al guardar la dirección' }, { status: 500 });
    }
}
