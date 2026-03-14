import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request) {
    try {
        const { userId, name, lastName, email, dni, phone } = await request.json();

        if (!userId) {
            return NextResponse.json({ error: 'ID de usuario requerido' }, { status: 400 });
        }

        // Si el email está presente, verificar que no esté en uso por otro usuario
        if (email) {
            const existingUser = await prisma.user.findFirst({
                where: {
                    email,
                    NOT: { id: userId }
                }
            });

            if (existingUser) {
                return NextResponse.json({ error: 'El email ya está en uso por otro usuario' }, { status: 400 });
            }
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                name,
                lastName,
                email,
                dni,
                phone
            },
            select: {
                id: true,
                name: true,
                lastName: true,
                email: true,
                role: true,
                dni: true,
                phone: true
            }
        });

        return NextResponse.json({
            user: updatedUser,
            message: 'Perfil actualizado correctamente'
        });

    } catch (error: any) {
        console.error('Update profile error:', error);
        return NextResponse.json({ error: 'Error interno al actualizar el perfil' }, { status: 500 });
    }
}
