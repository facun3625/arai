import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        console.log("POST API - RECEIVED BODY:", JSON.stringify(body, null, 2));
        const {
            name,
            slug,
            description,
            type,
            videoUrl,
            categories, // Array of category IDs
            price,
            compareAtPrice,
            stock,
            featuredImage,
            images,
            weight,
            width,
            height,
            length,
            addons, // Array of add-ons configuration objects
            variants // Array of variant objects
        } = body;

        // Basic validation
        if (!name || !slug) {
            return NextResponse.json({ error: "Nombre y slug requeridos" }, { status: 400 });
        }

        console.log("CREATING PRODUCT WITH BODY:", body);

        // Data object for Prisma
        const productData: any = {
            name,
            slug,
            description,
            type,
            videoUrl,
            price: parseFloat(price) || 0,
            compareAtPrice: (compareAtPrice && !isNaN(parseFloat(compareAtPrice))) ? parseFloat(compareAtPrice) : null,
            stock: parseInt(stock) || 0,
            featuredImage,
            images: JSON.stringify(images || []),
            weight: (weight && !isNaN(parseFloat(weight))) ? parseFloat(weight) : null,
            width: (width && !isNaN(parseFloat(width))) ? parseFloat(width) : null,
            height: (height && !isNaN(parseFloat(height))) ? parseFloat(height) : null,
            length: (length && !isNaN(parseFloat(length))) ? parseFloat(length) : null,
            addons: JSON.stringify(addons || []),
            categories: {
                connect: (categories || []).map((id: string) => ({ id }))
            }
        };

        let product: any;
        try {
            product = await (prisma.product as any).create({
                data: productData,
                include: {
                    categories: true,
                    variants: true
                }
            });
        } catch (err: any) {
            // Fallback for Prisma Client caching issue
            if (err.message.includes("Unknown argument `addons`")) {
                console.warn("Prisma Client out of sync (POST), using fallback");
                const { addons: _, ...safeData } = productData;
                product = await (prisma.product as any).create({
                    data: safeData,
                    include: {
                        categories: true,
                        variants: true
                    }
                });
                await prisma.$executeRawUnsafe(
                    `UPDATE "Product" SET "addons" = ? WHERE "id" = ?`,
                    productData.addons,
                    product.id
                );
                product.addons = productData.addons;
            } else {
                throw err;
            }
        }

        // Create variants if variable
        if (type === "VARIABLE" && variants && Array.isArray(variants)) {
            await (prisma.variant as any).createMany({
                data: variants.map((v: any) => ({
                    productId: product.id,
                    price: parseFloat(v.price) || 0,
                    compareAtPrice: (v.compareAtPrice && !isNaN(parseFloat(v.compareAtPrice))) ? parseFloat(v.compareAtPrice) : null,
                    stock: parseInt(v.stock) || 0,
                    images: JSON.stringify(v.images || []),
                    weight: (v.weight && !isNaN(parseFloat(v.weight))) ? parseFloat(v.weight) : null,
                    width: (v.width && !isNaN(parseFloat(v.width))) ? parseFloat(v.width) : null,
                    height: (v.height && !isNaN(parseFloat(v.height))) ? parseFloat(v.height) : null,
                    length: (v.length && !isNaN(parseFloat(v.length))) ? parseFloat(v.length) : null,
                    attributes: JSON.stringify(v.attributes || {})
                }))
            });
            // Refresh product to include variants
            product = await (prisma.product as any).findUnique({
                where: { id: product.id },
                include: { categories: true, variants: true }
            });
        }

        return NextResponse.json(product);
    } catch (error: any) {
        console.error("CREATE PRODUCT ERROR:", error);
        return NextResponse.json({
            error: "Error al crear producto: " + (error.message || "Unknown error")
        }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        const slug = searchParams.get("slug");

        if (id || slug) {
            const product = await prisma.product.findUnique({
                where: id ? { id } : { slug: slug as string },
                include: {
                    categories: true,
                    variants: true
                }
            });
            return NextResponse.json(product);
        }

        const products = await prisma.product.findMany({
            include: {
                categories: true,
                variants: true
            },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(products);
    } catch (error: any) {
        console.error("GET PRODUCTS ERROR:", error);
        return NextResponse.json({
            error: "Error al obtener productos: " + error.message
        }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const body = await req.json();
        console.log("PUT API - RECEIVED BODY:", JSON.stringify(body, null, 2));
        const {
            id,
            name,
            slug,
            description,
            type,
            videoUrl,
            categories,
            price,
            compareAtPrice,
            stock,
            featuredImage,
            images,
            weight,
            width,
            height,
            length,
            addons,
            variants
        } = body;

        if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

        // Update product involves clearing old relations and variants if needed
        // For simplicity in this first version, we'll do a simple update
        // In a real app, variant reconciliation (add/update/delete) is needed.

        const productData: any = {
            name,
            slug,
            description,
            type,
            videoUrl,
            price: parseFloat(price) || 0,
            compareAtPrice: (compareAtPrice && !isNaN(parseFloat(compareAtPrice))) ? parseFloat(compareAtPrice) : null,
            stock: parseInt(stock) || 0,
            featuredImage,
            images: JSON.stringify(images || []),
            weight: (weight && !isNaN(parseFloat(weight))) ? parseFloat(weight) : null,
            width: (width && !isNaN(parseFloat(width))) ? parseFloat(width) : null,
            height: (height && !isNaN(parseFloat(height))) ? parseFloat(height) : null,
            length: (length && !isNaN(parseFloat(length))) ? parseFloat(length) : null,
            addons: JSON.stringify(addons || []),
            categories: {
                set: (categories || []).map((id: string) => ({ id }))
            }
        };

        let product;
        try {
            product = await prisma.product.update({
                where: { id },
                data: productData
            });
        } catch (err: any) {
            if (err.message.includes("Unknown argument `addons`")) {
                console.warn("Prisma Client out of sync (PUT), using raw SQL fallback for addons");
                const { addons: _, ...safeData } = productData;
                product = await prisma.product.update({
                    where: { id },
                    data: safeData
                });
                await prisma.$executeRawUnsafe(
                    `UPDATE "Product" SET "addons" = ? WHERE "id" = ?`,
                    productData.addons,
                    id
                );
                product.addons = productData.addons;
            } else {
                throw err;
            }
        }

        // Reconcile variants if variable
        if (type === "VARIABLE" && variants) {
            // Delete old variants
            await prisma.variant.deleteMany({ where: { productId: id } });
            // Create new ones
            await prisma.variant.createMany({
                data: variants.map((v: any) => ({
                    productId: id,
                    price: parseFloat(v.price) || 0,
                    compareAtPrice: (v.compareAtPrice && !isNaN(parseFloat(v.compareAtPrice))) ? parseFloat(v.compareAtPrice) : null,
                    stock: parseInt(v.stock) || 0,
                    images: JSON.stringify(v.images || []),
                    weight: (v.weight && !isNaN(parseFloat(v.weight))) ? parseFloat(v.weight) : null,
                    width: (v.width && !isNaN(parseFloat(v.width))) ? parseFloat(v.width) : null,
                    height: (v.height && !isNaN(parseFloat(v.height))) ? parseFloat(v.height) : null,
                    length: (v.length && !isNaN(parseFloat(v.length))) ? parseFloat(v.length) : null,
                    attributes: JSON.stringify(v.attributes || {})
                }))
            });
        }

        return NextResponse.json(product);
    } catch (error: any) {
        console.error("UPDATE PRODUCT ERROR:", error);
        return NextResponse.json({
            error: "Error al actualizar producto: " + error.message
        }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) return NextResponse.json({ error: "ID de producto requerido" }, { status: 400 });

        await prisma.product.delete({
            where: { id }
        });

        return NextResponse.json({ message: "Producto eliminado" });
    } catch (error: any) {
        console.error("DELETE PRODUCT ERROR:", error);
        return NextResponse.json({
            error: "Error al eliminar producto: " + error.message
        }, { status: 500 });
    }
}
