"use client";

import { useEffect, useState, Suspense } from "react";
import { ShoppingBag, SlidersHorizontal, Loader2, CheckCircle2, ChevronRight, Ban, Search } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { trackPixelEvent } from "@/lib/fbPixel";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { PopupOverlay } from "@/components/ui/PopupOverlay";

export default function TiendaPage() {
    return (
        <Suspense>
            <TiendaContent />
        </Suspense>
    );
}

function TiendaContent() {
    const [mounted, setMounted] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [selectedCategory, setSelectedCategory] = useState(() => searchParams.get("categoria") || "todas");
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const addItem = useCartStore((state) => state.addItem);
    const cartItems = useCartStore((state) => state.items);

    useEffect(() => {
        setMounted(true);
        const fetchData = async () => {
            try {
                const [prodRes, catRes] = await Promise.all([
                    fetch("/api/products"),
                    fetch("/api/categories")
                ]);
                const prodData = await prodRes.json();
                const catData = await catRes.json();

                const parsedProducts = prodData.map((p: any) => ({
                    ...p,
                    images: typeof p.images === "string" ? JSON.parse(p.images) : p.images,
                }));

                setProducts(parsedProducts);
                // Keep all categories (needed for child slug resolution)
                setCategories(Array.isArray(catData) ? catData : []);
            } catch (error) {
                console.error("Error fetching store data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        const cat = searchParams.get("categoria");
        if (cat) setSelectedCategory(cat);
    }, [searchParams]);

    useEffect(() => {
        if (mounted) window.scrollTo({ top: 0, behavior: "smooth" });
    }, [selectedCategory, mounted]);

    // Top-level categories (only roots)
    const topLevelCategories = categories.filter((c: any) => !c.parentId);

    // Get all relevant slugs when a category is selected (includes children)
    const getRelevantSlugs = (slug: string): string[] => {
        const cat = categories.find((c: any) => c.slug === slug);
        if (!cat) return [slug];
        return [slug, ...(cat.children || []).map((c: any) => c.slug)];
    };

    const filteredProducts = (selectedCategory === "todas"
        ? products
        : products.filter(p => {
            const slugs = getRelevantSlugs(selectedCategory);
            return p.categories.some((c: any) => slugs.includes(c.slug));
        })
    ).filter(p => !searchTerm.trim() || p.name.toLowerCase().includes(searchTerm.trim().toLowerCase()));

    // Count for a category including its children
    const getCategoryCount = (cat: any): number => {
        const childSlugs = (cat.children || []).map((c: any) => c.slug);
        const allSlugs = [cat.slug, ...childSlugs];
        return products.filter(p => p.categories.some((c: any) => allSlugs.includes(c.slug))).length;
    };

    // Flat ordered list for mobile: parent, then children, then next parent
    const flatMobileCategories: Array<any & { _isChild?: boolean }> = [];
    for (const cat of topLevelCategories) {
        const count = getCategoryCount(cat);
        if (count === 0) continue;
        flatMobileCategories.push(cat);
        for (const child of (cat.children || [])) {
            if ((child._count?.products || 0) > 0)
                flatMobileCategories.push({ ...child, _isChild: true });
        }
    }

    const totalCount = products.length;

    const categoryButtonClass = (slug: string, isChild = false) =>
        `whitespace-nowrap transition-all text-[11px] capitalize flex justify-between items-center gap-3 md:w-full ${isChild ? "pl-5 md:pl-6" : ""} ${selectedCategory === slug
            ? "bg-primary text-white md:bg-primary/8 md:text-primary md:font-semibold px-4 py-2 md:py-2 md:px-3 rounded-full md:rounded-xl"
            : "bg-gray-50 text-gray-600 md:bg-transparent md:text-gray-600 md:hover:text-gray-900 md:hover:bg-gray-50 px-4 py-2 md:py-2 md:px-3 rounded-full md:rounded-xl"
        }`;

    const countClass = (slug: string) =>
        `text-[10px] font-medium ${selectedCategory === slug ? "text-white/70 md:text-primary/50" : "text-gray-500"}`;

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-primary font-montserrat">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="text-[11px] uppercase tracking-widest opacity-40">cargando tienda...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 lg:px-8 pt-6 pb-16 font-montserrat">
            <div className="flex flex-col md:flex-row gap-12">
                {/* Sidebar */}
                <aside className="w-full md:w-52 flex-shrink-0 md:sticky md:top-24 md:self-start">
                    <div className="hidden md:flex items-center gap-2 mb-5">
                        <SlidersHorizontal className="h-3.5 w-3.5 text-primary/60" />
                        <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Categorías</h2>
                    </div>

                    {/* Mobile: scrollable pills */}
                    <div className="md:hidden relative -mx-4">
                        {/* fade edges */}
                        <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
                        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
                        <div className="overflow-x-auto scrollbar-hide px-4 pb-1">
                            <div className="flex gap-2 w-max">
                                <button
                                    onClick={() => setSelectedCategory("todas")}
                                    className={`shrink-0 px-4 py-2 rounded-full text-[12px] font-semibold transition-all ${selectedCategory === "todas" ? "bg-primary text-white shadow-sm" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                                >
                                    Todas
                                </button>
                                {flatMobileCategories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setSelectedCategory(cat.slug)}
                                        className={`shrink-0 px-4 py-2 rounded-full text-[12px] font-semibold transition-all ${selectedCategory === cat.slug ? "bg-primary text-white shadow-sm" : "bg-gray-100 text-gray-500 hover:bg-gray-200"} ${cat._isChild ? "pl-3" : ""}`}
                                    >
                                        {cat._isChild && <span className="opacity-40 mr-1 text-[10px]">↳</span>}
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Desktop: nested vertical list */}
                    <ul className="hidden md:flex flex-col gap-0.5">
                        <li>
                            <button onClick={() => setSelectedCategory("todas")} className={categoryButtonClass("todas")}>
                                <span>todas</span>
                                <span className={countClass("todas")}>{totalCount}</span>
                            </button>
                        </li>
                        {topLevelCategories.map((cat) => {
                            const count = getCategoryCount(cat);
                            if (count === 0) return null;
                            const hasChildren = (cat.children || []).filter((c: any) => (c._count?.products || 0) > 0).length > 0;
                            return (
                                <li key={cat.id}>
                                    <button onClick={() => setSelectedCategory(cat.slug)} className={categoryButtonClass(cat.slug)}>
                                        <span className="flex-1 text-left">{cat.name}</span>
                                        <span className={countClass(cat.slug)}>{count}</span>
                                    </button>
                                    {/* Subcategories */}
                                    {hasChildren && (
                                        <ul className="mt-0.5 space-y-0.5">
                                            {(cat.children || [])
                                                .filter((c: any) => (c._count?.products || 0) > 0)
                                                .map((child: any) => (
                                                    <li key={child.id}>
                                                        <button onClick={() => setSelectedCategory(child.slug)} className={`${categoryButtonClass(child.slug)} pl-5`}>
                                                            <span className="flex items-center gap-1.5">
                                                                <ChevronRight className="h-3 w-3 opacity-30 flex-shrink-0" />
                                                                {child.name}
                                                            </span>
                                                            <span className={countClass(child.slug)}>{child._count?.products || 0}</span>
                                                        </button>
                                                    </li>
                                                ))}
                                        </ul>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </aside>

                {/* Grid de Productos */}
                <main className="flex-1">
                    <div className="relative mb-6">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Buscar productos..."
                            className="w-full bg-gray-50/60 border border-gray-100 rounded-2xl pl-11 pr-4 py-3 text-[13px] text-gray-700 focus:outline-none focus:border-primary/30 focus:bg-white transition-colors placeholder:text-gray-300"
                        />
                    </div>

                    <div className="flex items-center justify-between mb-10 pb-4 border-b border-gray-50">
                        <p className="text-[11px] text-gray-400 font-medium lowercase">
                            mostrando {filteredProducts.length} productos
                        </p>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold text-gray-400 capitalize">ordenar por:</span>
                            <select className="text-[11px] border-none bg-transparent font-bold text-gray-600 focus:ring-0 cursor-pointer capitalize">
                                <option>destacados</option>
                                <option>precio: menor a mayor</option>
                                <option>precio: mayor a menor</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-3 md:gap-x-6 gap-y-6 md:gap-y-8">
                        {filteredProducts.map((product) => {
                            const mainImage = product.featuredImage || product.images?.[0] || "/placeholder-product.png";
                            const hasVariations = product.type === "VARIABLE" && product.variants?.length > 0;
                            const displayPrice = hasVariations
                                ? Math.min(...product.variants.map((v: any) => v.price))
                                : product.price;
                            const isInCart = !hasVariations && cartItems.some(item => item.id === product.id);
                            const isOutOfStock = !hasVariations && product.stock <= 0;

                            return (
                                <div key={product.id} className="group bg-white rounded-[24px] border border-gray-100 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_60px_-10px_rgba(35,85,61,0.08)] hover:-translate-y-1.5 transition-all duration-700 overflow-hidden flex flex-col">
                                    <div className="p-4">
                                        <Link href={`/producto/${product.slug}`} className="aspect-[4/5] bg-gray-50/40 relative overflow-hidden rounded-[20px] block">
                                            {product.compareAtPrice && product.compareAtPrice > displayPrice && (
                                                <div className="absolute top-4 left-4 bg-primary text-white text-[10px] font-bold px-3 py-1.5 rounded-full z-10 shadow-lg border border-primary/5 uppercase">
                                                    -{Math.round(((product.compareAtPrice - displayPrice) / product.compareAtPrice) * 100)}%
                                                </div>
                                            )}
                                            <img
                                                src={mainImage}
                                                alt={product.name}
                                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-primary/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-4">
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        if (hasVariations) {
                                                            router.push(`/producto/${product.slug}`);
                                                        } else if (!isInCart && !isOutOfStock) {
                                                            addItem({ ...product, price: displayPrice, image: mainImage, quantity: 1 });
                                                            trackPixelEvent('AddToCart', {
                                                                content_ids: [product.id],
                                                                content_type: 'product',
                                                                content_name: product.name,
                                                                value: displayPrice,
                                                                currency: 'ARS',
                                                                contents: [{ id: product.id, quantity: 1 }]
                                                            });
                                                        }
                                                    }}
                                                    disabled={isInCart || isOutOfStock}
                                                    className={`w-full text-[11px] font-medium py-3.5 rounded-xl shadow-2xl transition-all flex items-center justify-center gap-2 transform translate-y-8 group-hover:translate-y-0 transition-transform duration-700 cursor-pointer ${isOutOfStock
                                                        ? "bg-red-50/80 text-red-400 backdrop-blur-sm shadow-none cursor-default border border-red-100"
                                                        : isInCart
                                                            ? "bg-[#23553d]/40 text-white/80 backdrop-blur-sm shadow-none cursor-default"
                                                            : "bg-primary text-white hover:bg-[#1a3f2d]"
                                                        }`}
                                                >
                                                    {isOutOfStock ? <Ban className="h-4 w-4" /> : isInCart ? <CheckCircle2 className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
                                                    {hasVariations ? "Ver opciones" : isOutOfStock ? "Sin stock" : isInCart ? "Ya en el carrito" : "Añadir al carrito"}
                                                </button>
                                            </div>
                                        </Link>
                                    </div>
                                    <div className="px-6 pb-6 pt-2 flex flex-col flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="h-px w-4 bg-primary/20"></span>
                                            <span className="text-[9px] font-bold text-primary/40 uppercase block">
                                                {product.categories?.[0]?.name || "Sin categoría"}
                                            </span>
                                        </div>
                                        <Link href={`/producto/${product.slug}`}>
                                            <h3 className="text-[14px] font-medium text-gray-800 line-clamp-2 min-h-[42px] leading-tight capitalize group-hover:text-primary transition-colors duration-300 overflow-hidden">
                                                {product.name}
                                            </h3>
                                        </Link>
                                        <div className="mt-auto pt-4 flex items-center justify-between">
                                            <div className="flex flex-col">
                                                {mounted ? (
                                                    <div className="flex flex-col -space-y-1">
                                                        {product.compareAtPrice && product.compareAtPrice > displayPrice && (
                                                            <span className="text-xs text-gray-300 line-through font-medium">
                                                                $ {product.compareAtPrice.toLocaleString("es-AR")}
                                                            </span>
                                                        )}
                                                        <span className="text-[17px] font-bold text-primary">
                                                            {hasVariations && <span className="text-[9px] mr-1 font-medium opacity-40">desde</span>}
                                                            $ {Number(displayPrice).toLocaleString("es-AR")}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-[17px] font-bold text-primary opacity-0">$ 0.000</span>
                                                )}
                                            </div>
                                            <Link
                                                href={`/producto/${product.slug}`}
                                                className="h-10 w-10 rounded-2xl bg-gray-50/80 border border-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-primary group-hover:text-white group-hover:border-primary group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-sm cursor-pointer"
                                            >
                                                <ShoppingBag className="h-4.5 w-4.5" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </main>
            </div>
            <PopupOverlay location="SHOP" />
        </div>
    );
}
