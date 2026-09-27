import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import ProductDetailClient from "./ProductDetailClient";

export const dynamic = "force-dynamic";

async function getProduct(slug: string) {
    return prisma.product.findUnique({ where: { slug } });
}

function getFirstImage(product: { featuredImage: string | null; images: string }): string | null {
    if (product.featuredImage) return product.featuredImage;
    try {
        const images = JSON.parse(product.images || "[]");
        return Array.isArray(images) && images.length > 0 ? images[0] : null;
    } catch {
        return null;
    }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const product = await getProduct(slug);
    if (!product) return { title: "Producto no encontrado - Araí Yerba Mate" };

    const image = getFirstImage(product);
    const description = product.description
        ? product.description.slice(0, 160)
        : `Comprá ${product.name} - Araí Yerba Mate. Envío a todo el país.`;

    return {
        title: `${product.name} - Araí Yerba Mate`,
        description,
        alternates: { canonical: `/producto/${product.slug}` },
        openGraph: {
            title: product.name,
            description,
            images: image ? [{ url: image }] : undefined,
        },
    };
}

export default async function ProductoDetallePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const product = await getProduct(slug);

    const approvedReviews = product
        ? await prisma.review.findMany({ where: { productId: product.id, isApproved: true }, select: { rating: true } })
        : [];
    const reviewCount = approvedReviews.length;
    const averageRating = reviewCount > 0
        ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
        : 0;

    const jsonLd = product ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description: product.description || undefined,
        image: getFirstImage(product) || undefined,
        offers: {
            "@type": "Offer",
            priceCurrency: "ARS",
            price: product.price,
            availability: product.stock > 0
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
        },
        ...(reviewCount > 0 && {
            aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: averageRating.toFixed(1),
                reviewCount,
            },
        }),
    } : null;

    return (
        <>
            {jsonLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            )}
            <ProductDetailClient />
        </>
    );
}
