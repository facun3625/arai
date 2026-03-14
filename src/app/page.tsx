"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  ArrowRight,
  Truck,
  ShieldCheck,
  Zap,
  ChevronRight,
  Star,
  Loader2,
  Image as LucideImage
} from "lucide-react";
import { PopupOverlay } from "@/components/ui/PopupOverlay";

export default function Home() {
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catsRes, prodsRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/products")
        ]);
        const catsData = await catsRes.json();
        const prodsData = await prodsRes.json();

        // Filter categories that have at least one product
        const activeCategories = catsData.filter((cat: any) => (cat._count?.products || 0) > 0);
        setCategories(activeCategories.slice(0, 4)); // Show top 4 categories
        setProducts(prodsData.slice(0, 8)); // Show top 8 products
      } catch (error) {
        console.error("Error fetching home data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-primary font-montserrat">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-[11px] uppercase tracking-widest opacity-40">preparando la experiencia araí...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col font-montserrat overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative h-[90vh] min-h-[600px] flex items-center overflow-hidden bg-[#0c120e]">
        {/* Background Decor */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-primary/20 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-primary/10 blur-[120px] rounded-full"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full z-10 grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-in fade-in slide-in-from-left-8 duration-1000">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest">Nueva Cosecha 2026</span>
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-light text-white leading-[0.95] tracking-tight">
              yerba mate <br />
              <span className="font-bold text-primary italic">premium.</span>
            </h1>
            <p className="text-white/60 text-lg md:text-xl max-w-lg leading-relaxed font-light">
              Descubrí el sabor auténtico de la selva misionera con nuestra selección exclusiva de yerbas orgánicas y blends especiales.
            </p>
            <div className="flex flex-wrap gap-6 pt-4">
              <Link
                href="/tienda"
                className="group relative px-10 py-5 bg-primary text-white text-[13px] font-bold rounded-2xl overflow-hidden transition-all hover:shadow-[0_20px_40px_-10px_rgba(35,85,61,0.5)] active:scale-95"
              >
                <span className="relative z-10 flex items-center gap-3">
                  Explorar Tienda <ShoppingBag className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                </span>
              </Link>
              <Link
                href="/tienda"
                className="px-10 py-5 bg-white/5 border border-white/10 text-white text-[13px] font-bold rounded-2xl hover:bg-white/10 transition-all flex items-center gap-3 active:scale-95"
              >
                Contactar <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <div className="relative aspect-square flex items-center justify-center animate-in fade-in zoom-in duration-1000 delay-300">
            <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full scale-75 animate-pulse"></div>
            <div className="relative z-10 w-4/5 h-4/5 flex items-center justify-center">
              {products[0] ? (
                <img
                  src={products[0]?.featuredImage || (typeof products[0]?.images === 'string' ? JSON.parse(products[0]?.images)[0] : products[0]?.images?.[0]) || "/placeholder.png"}
                  className="w-full h-full object-contain drop-shadow-[0_35px_60px_rgba(0,0,0,0.8)] hover:scale-105 transition-transform duration-1000"
                  alt="Hero Product"
                />
              ) : (
                <div className="text-white/20 uppercase tracking-widest">araí yerba mate</div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Banner */}
      <section className="bg-white border-y border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 group">
            <div className="w-16 h-16 bg-primary/5 rounded-[24px] flex items-center justify-center transition-transform group-hover:-translate-y-2">
              <Truck className="h-7 w-7 text-primary" />
            </div>
            <div className="space-y-1">
              <h4 className="text-[14px] font-bold text-gray-900 uppercase tracking-wider">Envío Nacional</h4>
              <p className="text-[12px] text-gray-500 leading-relaxed">Llegamos a todo el país con logística propia y seguimiento en tiempo real.</p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 group">
            <div className="w-16 h-16 bg-primary/5 rounded-[24px] flex items-center justify-center transition-transform group-hover:-translate-y-2">
              <ShieldCheck className="h-7 w-7 text-primary" />
            </div>
            <div className="space-y-1">
              <h4 className="text-[14px] font-bold text-gray-900 uppercase tracking-wider">Pago Seguro</h4>
              <p className="text-[12px] text-gray-500 leading-relaxed">Múltiples opciones de pago con la más alta seguridad cifrada.</p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 group">
            <div className="w-16 h-16 bg-primary/5 rounded-[24px] flex items-center justify-center transition-transform group-hover:-translate-y-2">
              <Star className="h-7 w-7 text-primary" />
            </div>
            <div className="space-y-1">
              <h4 className="text-[14px] font-bold text-gray-900 uppercase tracking-wider">Calidad Certificada</h4>
              <p className="text-[12px] text-gray-500 leading-relaxed">Yerba estacionada naturalmente sin aditivos ni conservantes.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-16">
          <div className="flex flex-col md:flex-row items-end justify-between gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-primary"></span>
                <span className="text-[11px] font-bold text-primary uppercase tracking-[0.3em]">nuestras líneas</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-light text-gray-900 tracking-tight">Elegí tu <span className="font-bold">experiencia.</span></h2>
            </div>
            <Link href="/tienda" className="flex items-center gap-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest hover:text-primary transition-colors group">
              Ver todo el catálogo <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/tienda?categoria=${cat.slug}`}
                className="group relative aspect-[4/5] rounded-[40px] overflow-hidden bg-white shadow-xl shadow-gray-200/50 hover:-translate-y-2 transition-all duration-700"
              >
                {cat.image ? (
                  <img src={cat.image} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt={cat.name} />
                ) : (
                  <div className="absolute inset-0 bg-primary/5 flex items-center justify-center">
                    <LucideImage className="h-10 w-10 text-primary/10" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
                <div className="absolute bottom-10 left-10 space-y-3">
                  <h3 className="text-2xl font-bold text-white leading-tight capitalize">{cat.name}</h3>
                  <div className="w-12 h-1 bg-primary transform origin-left scale-x-50 group-hover:scale-x-100 transition-transform duration-500"></div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-20">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-3">
              <span className="h-px w-8 bg-primary"></span>
              <span className="text-[11px] font-bold text-primary uppercase tracking-[0.3em]">selección exclusiva</span>
              <span className="h-px w-8 bg-primary"></span>
            </div>
            <h2 className="text-4xl md:text-5xl font-light text-gray-900 tracking-tight">Favoritos de la <span className="font-bold">comunidad.</span></h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
            {products.map((product) => {
              const images = typeof product.images === "string" ? JSON.parse(product.images) : (product.images || []);
              const mainImage = product.featuredImage || images[0] || "/placeholder.png";
              const displayPrice = product.type === "VARIABLE" && product.variants?.length > 0
                ? Math.min(...product.variants.map((v: any) => v.price))
                : product.price;

              const hasDiscount = product.compareAtPrice && product.compareAtPrice > displayPrice;

              return (
                <Link
                  key={product.id}
                  href={`/producto/${product.slug}`}
                  className="group flex flex-col space-y-6"
                >
                  <div className="aspect-[4/5] bg-gray-50 rounded-[32px] overflow-hidden relative shadow-2xl shadow-gray-100/50 group-hover:shadow-primary/10 transition-all duration-700">
                    <img src={mainImage} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt={product.name} />

                    {hasDiscount && (
                      <div className="absolute top-6 left-6 bg-primary text-white text-[10px] font-bold px-4 py-2 rounded-full uppercase tracking-widest shadow-xl">
                        -{Math.round(((product.compareAtPrice - displayPrice) / product.compareAtPrice) * 100)}%
                      </div>
                    )}

                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 translate-y-12 group-hover:translate-y-0 transition-transform duration-700 w-4/5">
                      <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-2xl flex items-center justify-center gap-3 border border-white/20">
                        <ShoppingBag className="h-4 w-4 text-primary" />
                        <span className="text-[10px] font-bold text-gray-900 uppercase tracking-widest">Ver Detalles</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 px-2">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-primary/40 uppercase tracking-widest">
                        {product.categories?.[0]?.name || "Original Line"}
                      </p>
                      <h3 className="text-xl font-medium text-gray-900 line-clamp-1 group-hover:text-primary transition-colors leading-tight capitalize">{product.name}</h3>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col -space-y-1">
                        {hasDiscount && (
                          <span className="text-xs text-gray-300 line-through font-medium">$ {product.compareAtPrice.toLocaleString('es-AR')}</span>
                        )}
                        <p className="text-2xl font-bold text-primary tracking-tight">$ {displayPrice.toLocaleString('es-AR')}</p>
                      </div>
                      <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-primary transition-all duration-500">
                        <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-white" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 md:px-12 bg-gray-50">
        <div className="max-w-7xl mx-auto rounded-[60px] bg-[#0c120e] relative overflow-hidden p-16 md:p-32 flex flex-col items-center text-center space-y-10 group">
          {/* Abstract Decor */}
          <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-primary/20 blur-[150px] transition-transform duration-1000 group-hover:scale-125"></div>
          <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-primary/10 blur-[100px] transition-transform duration-1000 group-hover:translate-x-12"></div>

          <h2 className="text-4xl md:text-6xl text-white font-light tracking-tight z-10">
            Sumate a la <span className="font-bold">Revolución Araí.</span>
          </h2>
          <p className="text-white/40 text-lg md:text-xl max-w-2xl leading-relaxed font-light z-10">
            Yerba mate equilibrada, estacionada y pensada para tu ritual diario. Recibí promociones exclusivas y lanzamientos en tu correo.
          </p>
          <div className="flex items-center gap-4 z-10 w-full max-w-lg">
            <input
              type="email"
              placeholder="Tu correo electrónico"
              className="flex-1 h-16 bg-white/5 border border-white/10 rounded-2xl px-8 text-white focus:outline-none focus:border-primary transition-all"
            />
            <button className="h-16 px-10 bg-primary text-white text-[12px] font-bold rounded-2xl hover:scale-105 transition-all shadow-2xl shadow-primary/20">
              Unirse
            </button>
          </div>
        </div>
      </section>
      <PopupOverlay location="HOME" />
    </div>
  );
}
