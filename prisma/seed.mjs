import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const adminPassword = await bcrypt.hash('12345678', 10);

    const admin = await prisma.user.upsert({
        where: { email: 'admin' },
        update: {},
        create: {
            email: 'admin',
            name: 'Super Administrador',
            password: adminPassword,
            role: 'ADMIN',
        },
    });

    console.log('Seeded admin user:', admin.email);
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error('Seed error:', e);
        await prisma.$disconnect();
        process.exit(1);
    });
