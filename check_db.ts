import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function diagnose() {
  console.log('--- DIAGNÓSTICO DE BASE DE DATOS ---');
  try {
    const invalidProducts = await prisma.product.findMany({
      where: {
        OR: [
          { weight: { lte: 0 } },
          { weight: null }
        ]
      },
      select: { name: true, weight: true }
    });

    if (invalidProducts.length > 0) {
      console.log('⚠️ PRODUCTOS CON PESO INVÁLIDO (OCA va a fallar):');
      invalidProducts.forEach(p => console.log(`- ${p.name}: ${p.weight}kg`));
    } else {
      console.log('✅ Todos los productos tienen peso cargado.');
    }

    const orderCount = await prisma.order.count();
    console.log(`📊 Total de pedidos en DB: ${orderCount}`);

  } catch (err) {
    console.error('❌ Error al consultar DB:', err);
  } finally {
    await prisma.$disconnect();
  }
}

diagnose();
