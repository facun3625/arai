"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  ShoppingBag,
  ArrowRight,
  Truck,
  ShieldCheck,
  Zap,
  ChevronRight,
  Star,
  Loader2,
  Image as LucideImage,
  ChevronLeft
} from "lucide-react";
import { PopupOverlay } from "@/components/ui/PopupOverlay";

export default function Home() {
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Newsletter states
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [newsletterStatus, setNewsletterStatus] = useState<"idle" | "success" | "error">("idle");
  const [newsletterMessage, setNewsletterMessage] = useState("");

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
        setCategories(activeCategories);

        // Fetch top sellers instead of just first products
        const topSellersRes = await fetch("/api/products/top-sellers");
        const topSellersData = await topSellersRes.json();
        setProducts(topSellersData);
      } catch (error) {
        console.error("Error fetching home data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;

    setIsSubscribing(true);
    setNewsletterStatus("idle");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newsletterEmail }),
      });

      const data = await res.json();

      if (res.ok) {
        setNewsletterStatus("success");
        setNewsletterMessage(data.message || "¡Gracias por suscribirte!");
        setNewsletterEmail("");
      } else {
        setNewsletterStatus("error");
        setNewsletterMessage(data.error || "Error al suscribirse");
      }
    } catch (error) {
      setNewsletterStatus("error");
      setNewsletterMessage("Error de conexión");
    } finally {
      setIsSubscribing(false);
    }
  };

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
      {/* New Premium Hero Grid Section - Refined Typography to prevent overflow */}
      <section className="bg-[#0c120e] pt-20 pb-20 overflow-hidden px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-5xl mx-auto rounded-[32px] overflow-hidden shadow-[0_50px_120px_-30px_rgba(0,0,0,1)] border border-white/5"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 h-auto md:h-[65vh] min-h-[550px]">

            {/* Column 1: Vos Elegis / Arma tu propio blend */}
            <div className="relative group overflow-hidden border-r border-white/5 h-[400px] md:h-full">
              <Image
                src="/images/proceso/1.webp"
                alt="Arma tu propio blend"
                fill
                className="object-cover grayscale-[40%] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-700" />
              <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-center items-center text-center">
                <span className="text-[12px] md:text-[14px] text-white font-light mb-3 italic">Vos elegis!</span>
                <h2 className="text-[24px] md:text-[32px] font-bold text-white leading-tight uppercase tracking-tight mb-6">
                  ARMA TU <br /> PROPIO <br /> BLEND
                </h2>
                <span className="text-[9px] md:text-[10px] text-white/50 mb-6 tracking-[0.3em] uppercase font-bold">Visita nuestra Tienda</span>
                <Link href="/tienda" className="px-8 py-3 bg-white text-black text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-white/90 transition-all rounded-full shadow-lg">
                  Comprar
                </Link>
              </div>
            </div>

            {/* Column 2: Yerba Mate */}
            <div className="relative group overflow-hidden border-r border-white/5 h-[400px] md:h-full">
              <Image
                src="/images/proceso/2.jpg"
                alt="Yerba Mate"
                fill
                className="object-cover grayscale-[40%] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition-all duration-700" />
              <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-start items-center text-center pt-20">
                <h2 className="text-[20px] md:text-[28px] font-bold text-white leading-tight uppercase tracking-[0.2em] mb-8">
                  YERBA <br /> MATE
                </h2>
                <Link href="/tienda?categoria=yerba-mate" className="px-8 py-3 bg-white text-black text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-white/90 transition-all rounded-full shadow-lg">
                  Comprar
                </Link>
              </div>
            </div>

            {/* Column 3: Hierbas & Familias Araí */}
            <div className="flex flex-col h-[800px] md:h-full">
              <div className="relative flex-1 group overflow-hidden border-b border-white/5">
                <Image
                  src="/images/proceso/3.jpg"
                  alt="Hierbas"
                  fill
                  className="object-cover grayscale-[40%] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition-all duration-700" />
                <div className="absolute inset-0 p-4 md:p-6 flex flex-col justify-center items-center text-center">
                  <h2 className="text-[18px] md:text-[24px] font-bold text-white uppercase tracking-[0.2em] mb-4">HIERBAS</h2>
                  <Link href="/tienda?categoria=hierbas" className="px-7 py-2.5 bg-white text-black text-[9px] font-bold uppercase tracking-[0.3em] hover:bg-white/90 transition-all rounded-full shadow-lg">
                    Comprar
                  </Link>
                </div>
              </div>
              <div className="relative flex-1 group overflow-hidden">
                <Image
                  src="/images/proceso/4.webp"
                  alt="Las distintas familias Araí"
                  fill
                  className="object-cover grayscale-[40%] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/60 group-hover:bg-black/40 transition-all duration-700" />
                <div className="absolute inset-0 p-4 md:p-6 flex flex-col justify-center items-center text-center">
                  <h2 className="text-[14px] md:text-[18px] font-bold text-white uppercase tracking-[0.1em] mb-4 leading-relaxed">
                    LAS DISTINTAS <br /> FAMILIAS <br /> ARAÍ
                  </h2>
                  <Link href="/tienda" className="px-7 py-2.5 bg-white text-black text-[9px] font-bold uppercase tracking-[0.3em] hover:bg-white/90 transition-all rounded-full shadow-lg">
                    Comprar
                  </Link>
                </div>
              </div>
            </div>

            {/* Column 4: Accesorios */}
            <div className="relative group overflow-hidden h-[400px] md:h-full">
              <Image
                src="/images/proceso/5.jpeg"
                alt="Accesorios"
                fill
                className="object-cover grayscale-[40%] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition-all duration-700" />
              <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-center items-center text-center">
                <h2 className="text-[20px] md:text-[28px] font-bold text-white leading-tight uppercase tracking-[0.15em] mb-8">
                  ACCESORIOS
                </h2>
                <Link href="/tienda?categoria=accesorios" className="px-8 py-3 bg-white text-black text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-white/90 transition-all rounded-full shadow-lg">
                  Comprar
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Transition Banner Section - Respecting natural image height */}
      <section className="relative w-full overflow-hidden bg-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full relative"
        >
          <img
            src="/images/proceso/banner.png"
            alt="Yerba Mate Araí Experience"
            className="w-full h-auto block"
          />
          {/* Subtle overlay to blend if needed, but keeping it clean as per user request for padding */}
          {/* <div className="absolute inset-0 bg-black/5" /> */}
        </motion.div>
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

      {/* Featured Categories - Horizontal Accordion */}
      <section className="py-12 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-10">
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

          <div className="flex overflow-x-auto pb-8 gap-8 no-scrollbar scroll-smooth">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/tienda?categoria=${cat.slug}`}
                className="flex-none w-[280px] md:w-[calc(25%-1.5rem)] group relative aspect-[4/5] rounded-[40px] overflow-hidden bg-white shadow-xl shadow-gray-200/50 hover:-translate-y-2 transition-all duration-700"
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
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-12">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-3">
              <span className="h-px w-8 bg-primary"></span>
              <span className="text-[11px] font-bold text-primary uppercase tracking-[0.3em]">selección exclusiva</span>
              <span className="h-px w-8 bg-primary"></span>
            </div>
            <h2 className="text-4xl md:text-5xl font-light text-gray-900 tracking-tight">Favoritos de la <span className="font-bold">comunidad.</span></h2>
          </div>

          <div className="relative group">
            {/* Edge mask for continuity */}
            <div
              className={`absolute right-0 top-0 bottom-12 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none transition-opacity duration-500 ${scrollProgress > 0.95 ? 'opacity-0' : 'opacity-100'}`}
            ></div>

            <div
              onScroll={(e) => {
                const container = e.currentTarget;
                const progress = container.scrollLeft / (container.scrollWidth - container.clientWidth);
                setScrollProgress(progress);
              }}
              className="flex overflow-x-auto gap-8 pb-12 no-scrollbar snap-x scroll-smooth -mx-6 px-6"
            >
              {products.map((product) => {
                const images = typeof product.images === "string" ? JSON.parse(product.images) : (product.images || []);
                const mainImage = product.featuredImage || images[0] || "/placeholder.png";
                const displayPrice = product.type === "VARIABLE" && product.variants?.length > 0
                  ? Math.min(...product.variants.map((v: any) => v.price))
                  : product.price;

                const hasDiscount = product.compareAtPrice && product.compareAtPrice > displayPrice;

                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex-none w-[300px] snap-start"
                  >
                    <Link
                      href={`/producto/${product.slug}`}
                      className="group flex flex-col space-y-6 h-full"
                    >
                      <div className="aspect-[4/5] bg-gray-50 rounded-[32px] overflow-hidden relative shadow-2xl shadow-gray-100/50 group-hover:shadow-primary/10 transition-all duration-700">
                        <img src={mainImage} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt={product.name} />

                        {hasDiscount && (
                          <div className="absolute top-6 left-6 bg-primary text-white text-[10px] font-bold px-4 py-2 rounded-full uppercase tracking-widest shadow-xl z-10">
                            -{Math.round(((product.compareAtPrice - displayPrice) / product.compareAtPrice) * 100)}%
                          </div>
                        )}

                        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                        {/* Hover Overlay - Ver Detalles - Adjusted to fix cutoff */}
                        <div className="absolute bottom-6 left-0 right-0 px-6 transform translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 z-20">
                          <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-2xl flex items-center justify-center gap-3 border border-white/20 w-full transform group-hover:scale-105 transition-transform">
                            <ShoppingBag className="h-4 w-4 text-primary" />
                            <span className="text-[10px] font-bold text-gray-900 uppercase tracking-widest">Ver Detalles</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 px-2 flex-grow">
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
                  </motion.div>
                );
              })}
            </div>

            {/* Scroll Progress Bar */}
            <div className="mt-8 max-w-[200px] mx-auto h-1 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary"
                style={{ width: `${Math.max(10, scrollProgress * 100)}%` }}
              />
            </div>

            {/* Navigation Buttons for desktop */}
            <div className="hidden md:block">
              <button
                onClick={(e) => {
                  const container = (e.currentTarget.parentElement?.previousElementSibling?.previousElementSibling as HTMLDivElement);
                  container.scrollBy({ left: -320, behavior: 'smooth' });
                }}
                className={`absolute -left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center text-primary border border-gray-100 transition-all z-30 ${scrollProgress > 0.01 ? 'opacity-40 hover:opacity-100 hover:scale-110' : 'opacity-0 pointer-events-none'}`}
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={(e) => {
                  const container = (e.currentTarget.parentElement?.previousElementSibling?.previousElementSibling as HTMLDivElement);
                  container.scrollBy({ left: 320, behavior: 'smooth' });
                }}
                className={`absolute -right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center text-primary border border-gray-100 transition-all z-30 ${scrollProgress < 0.99 ? 'opacity-40 hover:opacity-100 hover:scale-110' : 'opacity-0 pointer-events-none'}`}
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 px-6 md:px-12 bg-gray-50">
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
          <form onSubmit={handleNewsletterSubmit} className="flex flex-col gap-4 z-10 w-full max-w-lg">
            <div className="flex items-center gap-4">
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Tu correo electrónico"
                className="flex-1 h-16 bg-white/5 border border-white/10 rounded-2xl px-8 text-white focus:outline-none focus:border-primary transition-all"
                disabled={isSubscribing || newsletterStatus === "success"}
              />
              <button
                type="submit"
                disabled={isSubscribing || newsletterStatus === "success"}
                className={`h-16 px-10 rounded-2xl text-[12px] font-bold transition-all shadow-2xl relative overflow-hidden ${newsletterStatus === "success"
                  ? "bg-green-600 text-white cursor-default"
                  : "bg-primary text-white hover:scale-105 shadow-primary/20"
                  }`}
              >
                {isSubscribing ? (
                  <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                ) : newsletterStatus === "success" ? (
                  "¡Suscrito!"
                ) : (
                  "Unirse"
                )}
              </button>
            </div>
            {newsletterStatus !== "idle" && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`text-[12px] font-medium tracking-wider uppercase ${newsletterStatus === "success" ? "text-green-400" : "text-red-400"
                  }`}
              >
                {newsletterMessage}
              </motion.p>
            )}
          </form>
        </div>
      </section>
      <PopupOverlay location="HOME" />
    </div>
  );
}
