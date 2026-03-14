import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const data = await request.json();

        if (!id) {
            return NextResponse.json({ error: 'ID de dirección requerido' }, { status: 400 });
        }

        // If explicitly setting as default, unset others first
        if (data.isDefault && data.userId) {
            await prisma.address.updateMany({
                where: { userId: data.userId },
                data: { isDefault: false }
            });
        }

        const address = await prisma.address.update({
            where: { id },
            data: {
                street: data.street,
                number: data.number,
                apartment: data.apartment,
                city: data.city,
                province: data.province,
                zipCode: data.zipCode,
                phone: data.phone,
                dni: data.dni,
                isDefault: data.isDefault
            }
        });

        return NextResponse.json({ address, message: 'Dirección actualizada correctamente' });

    } catch (error: any) {
        console.error('Update address error:', error);
        return NextResponse.json({ error: 'Error interno al actualizar la dirección' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        console.log('Attempting to delete address with ID:', id);

        if (!id) {
            return NextResponse.json({ error: 'ID de dirección requerido' }, { status: 400 });
        }

        const result = await prisma.address.deleteMany({
            where: { id }
        });

        console.log('Delete result:', result);

        if (result.count === 0) {
            return NextResponse.json({ error: 'La dirección no existe o ya fue eliminada' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Dirección eliminada correctamente' });

    } catch (error: any) {
        console.error('Delete address error details:', {
            message: error.message,
            stack: error.stack
        });
        return NextResponse.json({
            error: 'Error interno al eliminar la dirección',
            details: error.message
        }, { status: 500 });
    }
}
