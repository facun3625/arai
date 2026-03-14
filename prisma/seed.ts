import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const defaultCategory = await prisma.category.upsert({
        where: { slug: 'sin-categoria' },
        update: {},
        create: {
            name: 'Sin categoría',
            slug: 'sin-categoria',
            description: 'Categoría por defecto para productos sin asignar',
        },
    })
    console.log({ defaultCategory })
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
