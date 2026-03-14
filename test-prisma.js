const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
    console.log("Checking for 'subscriber' model...");
    const models = Object.keys(prisma).filter(k => !k.startsWith('$'));
    console.log("Available models:", models);

    if (prisma.subscriber || prisma.Subscriber) {
        console.log("SUCCESS: 'subscriber' model found!");
    } else {
        console.log("FAILURE: 'subscriber' model NOT found.");
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
