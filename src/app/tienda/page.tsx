"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ShoppingBag, SlidersHorizontal, Loader2, CheckCircle2 } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PopupOverlay } from "@/components/ui/PopupOverlay";

export default function TiendaPage() {
    const [mounted, setMounted] = useState(false);
    const router = useRouter();
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [selectedCategory, setSelectedCategory] = useState("todas");
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
                    images: typeof p.images === 'string' ? JSON.parse(p.images) : p.images,
                }));

                setProducts(parsedProducts);
                // Filter categories that have at least one product
                const activeCategories = catData.filter((cat: any) => (cat._count?.products || 0) > 0);
                setCategories(activeCategories);
            } catch (error) {
                console.error("Error fetching store data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    // Scroll to top on category change
    useEffect(() => {
        if (mounted) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [selectedCategory, mounted]);

    const filteredProducts = selectedCategory === "todas"
        ? products
        : products.filter(p => p.categories.some((c: any) => c.slug === selectedCategory));

    // Calculate counts based on current products
    const totalCount = products.length;

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
                {/* Sidebar Filtros / Categories Toggle */}
                <aside className="w-full md:w-64 flex-shrink-0">
                    <div className="md:pb-6 md:mb-8 md:border-b md:border-gray-100 flex items-center gap-2 mb-4">
                        <SlidersHorizontal className="h-4 w-4 text-primary" />
                        <h2 className="text-sm font-bold text-gray-800 capitalize">Categorías</h2>
                    </div>

                    {/* Horizontal scroll on mobile, vertical list on desktop */}
                    <div className="overflow-x-auto pb-4 -mx-4 px-4 md:px-0 md:pb-0 scrollbar-hide">
                        <ul className="flex flex-row md:flex-col gap-2 md:gap-0.5 min-w-max md:min-w-0 font-montserrat">
                            <li>
                                <button
                                    onClick={() => setSelectedCategory("todas")}
                                    className={`whitespace-nowrap px-4 py-2 md:py-1.5 rounded-full md:rounded-lg transition-all text-[11px] md:text-xs capitalize flex justify-between items-center gap-2 md:w-full ${selectedCategory === "todas"
                                        ? "bg-primary text-white md:bg-transparent md:text-primary md:font-medium"
                                        : "bg-gray-50 text-gray-400 md:bg-transparent md:hover:text-gray-600 md:hover:bg-gray-50/50"
                                        }`}
                                >
                                    <span>todas</span>
                                    <span className={`text-[9px] md:text-[10px] ${selectedCategory === "todas" ? "text-white/60 md:text-primary/60" : "text-gray-300"}`}>
                                        {totalCount}
                                    </span>
                                </button>
                            </li>
                            {categories.map((cat) => (
                                <li key={cat.id}>
                                    <button
                                        onClick={() => setSelectedCategory(cat.slug)}
                                        className={`whitespace-nowrap px-4 py-2 md:py-1.5 rounded-full md:rounded-lg transition-all text-[11px] md:text-xs capitalize flex justify-between items-center gap-2 md:w-full ${selectedCategory === cat.slug
                                            ? "bg-primary text-white md:bg-transparent md:text-primary md:font-medium"
                                            : "bg-gray-50 text-gray-400 md:bg-transparent md:hover:text-gray-600 md:hover:bg-gray-50/50"
                                            }`}
                                    >
                                        <span className="flex-1">{cat.name}</span>
                                        <span className={`text-[9px] md:text-[10px] ${selectedCategory === cat.slug ? "text-white/60 md:text-primary/60" : "text-gray-300"}`}>
                                            {cat._count?.products || 0}
                                        </span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </aside>

                {/* Grid de Productos */}
                <main className="flex-1">
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

                            return (
                                <div key={product.id} className="group bg-white rounded-[24px] border border-gray-100 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_60px_-10px_rgba(35,85,61,0.08)] hover:-translate-y-1.5 transition-all duration-700 overflow-hidden flex flex-col">
                                    {/* Product Image Container */}
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

                                            {/* Quick Add Overlay */}
                                            <div className="absolute inset-0 bg-primary/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-4">
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        if (hasVariations) {
                                                            router.push(`/producto/${product.slug}`);
                                                        } else if (!isInCart) {
                                                            addItem({ ...product, price: displayPrice, image: mainImage, quantity: 1 });
                                                        }
                                                    }}
                                                    disabled={isInCart}
                                                    className={`w-full text-[11px] font-medium py-3.5 rounded-xl shadow-2xl transition-all flex items-center justify-center gap-2 transform translate-y-8 group-hover:translate-y-0 transition-transform duration-700 cursor-pointer ${isInCart
                                                        ? "bg-[#23553d]/40 text-white/80 backdrop-blur-sm shadow-none cursor-default"
                                                        : "bg-primary text-white hover:bg-[#1a3f2d]"
                                                        }`}
                                                >
                                                    {isInCart ? <CheckCircle2 className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
                                                    {hasVariations ? "Ver opciones" : isInCart ? "Ya en el carrito" : "Añadir al carrito"}
                                                </button>
                                            </div>
                                        </Link>
                                    </div>

                                    {/* Product Info */}
                                    <div className="px-6 pb-6 pt-2 flex flex-col flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="h-px w-4 bg-primary/20"></span>
                                            <span className="text-[9px] font-bold text-primary/40 uppercase block">
                                                {product.categories?.[0]?.name || "Sin categoría"}
                                            </span>
                                        </div>
                                        <Link href={`/producto/${product.slug}`}>
                                            <h3 className="text-[14px] font-medium text-gray-800 line-clamp-2 min-h-[42px] leading-tight capitalize group-hover:text-primary transition-colors duration-300">
                                                {product.name}
                                            </h3>
                                        </Link>

                                        <div className="mt-8 flex items-center justify-between">
                                            <div className="flex flex-col">
                                                {mounted ? (
                                                    <div className="flex flex-col -space-y-1">
                                                        {product.compareAtPrice && product.compareAtPrice > displayPrice && (
                                                            <span className="text-xs text-gray-300 line-through font-medium">
                                                                $ {product.compareAtPrice.toLocaleString('es-AR')}
                                                            </span>
                                                        )}
                                                        <span className="text-[17px] font-bold text-primary">
                                                            {hasVariations && <span className="text-[9px] mr-1 font-medium opacity-40">desde</span>}
                                                            $ {Number(displayPrice).toLocaleString('es-AR')}
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
