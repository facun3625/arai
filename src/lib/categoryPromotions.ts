import { Prisma, PrismaClient } from "@prisma/client";

type PrismaLike = PrismaClient | Prisma.TransactionClient;

export interface CategoryPromoItemInput {
    productId: string;
    variantId?: string | null;
    quantity: number;
}

export interface CategoryPromoDetail {
    categoryId: string;
    categoryName: string;
    paidUnits: number;
    freeUnits: number;
    discount: number;
}

export interface CategoryPromoResult {
    discount: number;
    details: CategoryPromoDetail[];
}

/**
 * "2x1 por categoría": entre las unidades elegidas de una categoría con promo activa,
 * se ordenan de mayor a menor precio y se paga solo la mitad más cara de cada par
 * (techo(N/2) pagos, piso(N/2) unidades gratis). Recalculado siempre contra la DB
 * (nunca confía en precios/cantidades enviados por el cliente) porque define cuánto
 * se cobra en la orden.
 */
export async function computeCategoryPromoDiscount(
    prisma: PrismaLike,
    items: CategoryPromoItemInput[]
): Promise<CategoryPromoResult> {
    const promotions = await prisma.categoryPromotion.findMany({
        where: { isActive: true },
        include: { category: { select: { id: true, name: true } } }
    });

    if (promotions.length === 0 || items.length === 0) {
        return { discount: 0, details: [] };
    }

    const productIds = Array.from(new Set(items.map((i) => i.productId).filter(Boolean)));
    if (productIds.length === 0) {
        return { discount: 0, details: [] };
    }

    const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: {
            id: true,
            price: true,
            categories: { select: { id: true } },
            variants: { select: { id: true, price: true } }
        }
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    type Unit = { price: number; categoryIds: Set<string> };
    let units: Unit[] = [];

    for (const item of items) {
        const product = productMap.get(item.productId);
        if (!product) continue;

        let price = product.price;
        if (item.variantId) {
            const variant = product.variants.find((v) => v.id === item.variantId);
            if (variant) price = variant.price;
        }

        const categoryIds = new Set(product.categories.map((c) => c.id));
        const qty = Math.max(0, Math.floor(Number(item.quantity) || 0));
        for (let i = 0; i < qty; i++) {
            units.push({ price, categoryIds });
        }
    }

    const details: CategoryPromoDetail[] = [];
    let totalDiscount = 0;

    for (const promo of promotions) {
        const bucket: Unit[] = [];
        units = units.filter((unit) => {
            if (unit.categoryIds.has(promo.categoryId)) {
                bucket.push(unit);
                return false; // consumed, can't count toward another category promo
            }
            return true;
        });

        if (bucket.length < 2) continue;

        bucket.sort((a, b) => b.price - a.price);

        let categoryDiscount = 0;
        let freeUnits = 0;
        for (let i = 1; i < bucket.length; i += 2) {
            categoryDiscount += bucket[i].price;
            freeUnits += 1;
        }

        if (categoryDiscount > 0) {
            totalDiscount += categoryDiscount;
            details.push({
                categoryId: promo.categoryId,
                categoryName: promo.category.name,
                paidUnits: bucket.length - freeUnits,
                freeUnits,
                discount: categoryDiscount
            });
        }
    }

    return { discount: totalDiscount, details };
}
