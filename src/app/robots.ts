import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXTAUTH_URL || "https://yerbamatearai.com.ar";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: "*",
            allow: "/",
            disallow: ["/admin", "/api", "/checkout", "/carrito", "/mi-cuenta"],
        },
        sitemap: `${siteUrl}/sitemap.xml`,
    };
}
