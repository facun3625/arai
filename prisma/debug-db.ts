import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

console.log('DATABASE_URL:', process.env.DATABASE_URL);

const prisma = new PrismaClient();

async function test() {
    try {
        const users = await prisma.user.findMany();
        console.log('Success! Users found:', users);
    } catch (err) {
        console.error('Connection error detail:', err);
    } finally {
        await prisma.$disconnect();
    }
}

test();
