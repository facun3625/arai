import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const siteUrl = process.env.NEXTAUTH_URL || "https://yerbamatearai.com.ar";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const [products, categories] = await Promise.all([
        prisma.product.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
        prisma.category.findMany({ select: { slug: true, updatedAt: true } }),
    ]);

    const staticRoutes: MetadataRoute.Sitemap = [
        { url: `${siteUrl}/`, changeFrequency: "daily", priority: 1 },
        { url: `${siteUrl}/tienda`, changeFrequency: "daily", priority: 0.9 },
        { url: `${siteUrl}/proceso`, changeFrequency: "monthly", priority: 0.5 },
        { url: `${siteUrl}/legales/terminos`, changeFrequency: "yearly", priority: 0.2 },
        { url: `${siteUrl}/legales/privacidad`, changeFrequency: "yearly", priority: 0.2 },
        { url: `${siteUrl}/legales/devoluciones`, changeFrequency: "yearly", priority: 0.2 },
    ];

    const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
        url: `${siteUrl}/producto/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: "weekly",
        priority: 0.8,
    }));

    const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
        url: `${siteUrl}/tienda?categoria=${c.slug}`,
        lastModified: c.updatedAt,
        changeFrequency: "weekly",
        priority: 0.6,
    }));

    return [...staticRoutes, ...productRoutes, ...categoryRoutes];
}
