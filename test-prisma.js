const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const count = await prisma.subscriber.count();
        console.log('Subscriber count:', count);
    } catch (e) {
        console.error('Error accessing subscriber:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
