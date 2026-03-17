import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    console.log('Login API hit. DATABASE_URL:', process.env.DATABASE_URL);
    try {
        const { email, password } = await request.json();

        // Verificar si existe el admin inicial solicitado por el USER
        // Si no existe, lo creamos on-demand para asegurar acceso
        if (email === 'admin') {
            const adminExists = await prisma.user.findUnique({
                where: { email: 'admin' }
            });

            if (!adminExists) {
                const hashedPassword = await bcrypt.hash('12345678', 10);
                await prisma.user.create({
                    data: {
                        email: 'admin',
                        name: 'Super Administrador',
                        password: hashedPassword,
                        role: 'ADMIN'
                    }
                });
                console.log('Super Administrador creado on-demand');
            }
        }

        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user || !user.password) {
            return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
        }

        // Aquí se podría generar un JWT, pero por ahora devolvemos el user
        const { password: _, ...userWithoutPassword } = user;

        return NextResponse.json({
            user: userWithoutPassword,
            message: 'Login exitoso'
        });

    } catch (error: any) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
