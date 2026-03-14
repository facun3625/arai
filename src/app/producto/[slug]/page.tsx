"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ShoppingBag,
    ChevronLeft,
    Loader2,
    Minus,
    Plus,
    Play,
    Truck,
    ShieldCheck,
    Star,
    Heart,
    Repeat,
    Mail,
    Facebook,
    Twitter,
    Instagram,
    Linkedin,
    Share2,
    CheckCircle2
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import Link from "next/link";

export default function ProductoDetallePage() {
    const { slug } = useParams();
    const router = useRouter();
    const [product, setProduct] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedVariant, setSelectedVariant] = useState<any>(null);
    const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
    const [quantity, setQuantity] = useState(1);
    const [activeImage, setActiveImage] = useState("");
    const [selectedAddons, setSelectedAddons] = useState<Record<string, string[]>>({});
    const addItem = useCartStore((state) => state.addItem);
    const cartItems = useCartStore((state) => state.items);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await fetch(`/api/products?slug=${slug}`);
                if (res.ok) {
                    const data = await res.json();
                    setProduct(data);

                    // Parse images safely
                    let pImages = [];
                    try {
                        pImages = typeof data.images === 'string' ? JSON.parse(data.images) : (data.images || []);
                    } catch (e) {
                        // ignore parsing error
                        pImages = [];
                    }

                    setActiveImage(data.featuredImage || pImages[0] || "");

                    // Initial attribute selection if variable
                    if (data.type === "VARIABLE" && data.variants?.length > 0) {
                        const firstVariant = data.variants[0];
                        try {
                            const initialAttrs = typeof firstVariant.attributes === 'string'
                                ? JSON.parse(firstVariant.attributes)
                                : (firstVariant.attributes || {});
                            setSelectedAttributes(initialAttrs);
                        } catch (e) {
                            // ignore parsing error
                        }
                    }
                } else {
                    router.push("/tienda");
                }
            } catch (error) {
                // ignore
            } finally {
                setIsLoading(false);
            }
        };
        fetchProduct();
    }, [slug, router]);

    // Update variant matching when attributes change
    useEffect(() => {
        if (product?.type === "VARIABLE" && product.variants?.length > 0) {
            const match = product.variants.find((v: any) => {
                let vAttrs: Record<string, any> = {};
                try {
                    vAttrs = typeof v.attributes === 'string' ? JSON.parse(v.attributes) : (v.attributes || {});
                } catch (e) {
                    // ignore
                }

                return Object.entries(selectedAttributes).every(([key, value]) => {
                    return vAttrs[key] === value;
                });
            });

            if (match) {
                setSelectedVariant(match);
                let vImages = [];
                try {
                    vImages = typeof match.images === 'string' ? JSON.parse(match.images) : (match.images || []);
                } catch (e) {
                    // ignore
                }

                if (vImages.length > 0) {
                    setActiveImage(vImages[0]);
                }
            } else {
                setSelectedVariant(null);
            }
        }
    }, [selectedAttributes, product]);

    const handleAddToCart = () => {
        if (product.type === "VARIABLE" && !selectedVariant) {
            alert("Por favor selecciona todas las opciones");
            return;
        }

        const basePrice = selectedVariant ? Number(selectedVariant.price) : Number(product.price);

        const itemToAdd = {
            id: selectedVariant ? `${product.id}-${selectedVariant.id}` : product.id,
            name: product.name,
            price: isNaN(basePrice) ? 0 : basePrice,
            image: activeImage,
            variant: selectedVariant?.attributes,
            addons: selectedAddons,
            quantity: quantity
        };

        addItem(itemToAdd);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-primary font-montserrat">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="text-[11px] uppercase tracking-widest opacity-40 text-center px-4">preparando la experiencia araí...</p>
            </div>
        );
    }

    if (!product) return null;

    // Helper for safe pricing
    const getPrice = (p: any) => {
        const val = Number(p);
        return isNaN(val) ? 0 : val;
    };

    const basePrice = selectedVariant ? getPrice(selectedVariant.price) : getPrice(product.price);
    const compareAtPrice = selectedVariant ? getPrice(selectedVariant.compareAtPrice) : getPrice(product.compareAtPrice);
    const totalPrice = basePrice * quantity;

    // Helper for safe images
    const getImages = (imgs: any) => {
        if (!imgs) return [];
        if (Array.isArray(imgs)) return imgs;
        try {
            return JSON.parse(imgs);
        } catch (e) {
            return [];
        }
    };

    const pImages = getImages(product.images);
    const vImages = selectedVariant ? getImages(selectedVariant.images) : [];

    // Combine images
    const allImages = vImages.length > 0 ? vImages : pImages;
    if (product.featuredImage && !allImages.includes(product.featuredImage)) {
        allImages.unshift(product.featuredImage);
    }
    const uniqueImages = Array.from(new Set(allImages)) as string[];

    const itemId = selectedVariant ? `${product.id}-${selectedVariant.id}` : product.id;
    const isInCart = cartItems.some(item => {
        const sameId = item.id === itemId;
        const sameAddons = JSON.stringify(item.addons || {}) === JSON.stringify(selectedAddons || {});
        return sameId && sameAddons;
    });

    return (
        <div className="bg-white min-h-screen font-montserrat">
            <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6 pb-16">
                {/* Breadcrumbs */}
                <nav className="mb-12 flex items-center gap-3 text-[10px] xl:text-[11px] font-normal text-gray-500">
                    <Link href="/" className="hover:text-primary transition-colors capitalize">Inicio</Link>
                    <span className="text-gray-200">/</span>
                    <Link href="/tienda" className="hover:text-primary transition-colors capitalize">Tienda</Link>
                    <span className="text-gray-200">/</span>
                    <span className="text-gray-900 font-medium capitalize">{product.name}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">
                    {/* Left Column: Gallery */}
                    <div className="lg:col-span-5 space-y-8">
                        <div className="relative aspect-square bg-[#fcfcfc] rounded-[32px] overflow-hidden group border border-gray-100/50">
                            {activeImage ? (
                                <img
                                    src={activeImage}
                                    alt={product.name}
                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-200 uppercase tracking-widest text-[10px] font-bold">
                                    Sin imagen
                                </div>
                            )}

                            {compareAtPrice > basePrice && (
                                <div className="absolute top-8 left-8 bg-primary text-white text-[10px] font-bold px-5 py-2.5 rounded-full uppercase tracking-widest shadow-2xl border border-primary/20 animate-in fade-in zoom-in duration-500">
                                    -{Math.round(((compareAtPrice - basePrice) / compareAtPrice) * 100)}% off
                                </div>
                            )}
                        </div>

                        {uniqueImages.length > 1 && (
                            <div className="grid grid-cols-5 gap-5 px-2">
                                {uniqueImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImage(img)}
                                        className={`aspect-square rounded-[20px] overflow-hidden border-2 transition-all duration-500 shadow-sm ${activeImage === img ? 'border-primary ring-4 ring-primary/5 scale-105' : 'border-transparent opacity-40 hover:opacity-100 hover:scale-105'}`}
                                    >
                                        <img src={img} alt={`${product.name} ${idx}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right Column: Info */}
                    <div className="lg:col-span-7 flex flex-col space-y-10 py-2">
                        {/* Header Info */}
                        <div className="space-y-6">
                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-light text-gray-900 leading-tight tracking-tight capitalize">
                                {product.name}
                            </h1>

                            <div className="flex items-center gap-4 text-[10px] xl:text-[11px] font-normal">
                                <div className="flex items-center gap-2 text-primary/60">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary/40"></span>
                                    Araí Selección
                                </div>
                                <span className="text-gray-200">|</span>
                                <span className="text-[#23553d] font-medium">
                                    En Stock
                                </span>
                            </div>

                            <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-8 py-2">
                                <div className="flex items-baseline gap-3 min-w-[140px] md:min-w-[180px]">
                                    <span className="text-4xl font-light text-gray-900 tracking-tighter">$ {(basePrice * quantity).toLocaleString('es-AR')}</span>
                                    {compareAtPrice > basePrice && (
                                        <span className="text-[17px] text-gray-400 line-through font-light">$ {(compareAtPrice * quantity).toLocaleString('es-AR')}</span>
                                    )}
                                </div>

                                <div className="flex items-center gap-4 flex-wrap mt-2">
                                    <div className="flex items-center bg-gray-50 rounded-xl border border-gray-100 h-12">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="w-10 h-full flex items-center justify-center text-gray-400 hover:text-primary transition-all"
                                        >
                                            <Minus className="h-4 w-4" />
                                        </button>
                                        <span className="w-10 text-center font-medium text-[14px] text-gray-600">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(quantity + 1)}
                                            className="w-10 h-full flex items-center justify-center text-gray-400 hover:text-primary transition-all"
                                        >
                                            <Plus className="h-4 w-4" />
                                        </button>
                                    </div>

                                    <button
                                        onClick={handleAddToCart}
                                        disabled={isInCart}
                                        className={`h-12 rounded-xl font-medium text-[12px] uppercase tracking-widest flex items-center justify-center gap-2.5 transition-all active:scale-95 px-6 ${isInCart
                                            ? "bg-[#23553d]/20 text-[#23553d] border border-[#23553d]/10 cursor-default"
                                            : "bg-primary text-white shadow-md hover:-translate-y-0.5 hover:shadow-xl shadow-primary/10"
                                            }`}
                                    >
                                        {isInCart ? <CheckCircle2 className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
                                        {isInCart ? "Ya en el Carrito" : "Añadir al Carrito"}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-gray-100 w-full"></div>

                        {/* Variations */}
                        {product.type === "VARIABLE" && product.variants?.length > 0 && (
                            <div className="space-y-10">
                                {/* We collect all unique attributes and their values */}
                                {(() => {
                                    const allVattrs = product.variants.map((v: any) => {
                                        try {
                                            return typeof v.attributes === 'string' ? JSON.parse(v.attributes) : (v.attributes || {});
                                        } catch (e) {
                                            return {};
                                        }
                                    });
                                    const attributeNames = Object.keys(allVattrs[0] || {});

                                    return attributeNames.map((name) => {
                                        const values = Array.from(new Set(allVattrs.map((v: any) => v[name])));
                                        const isColor = name.toLowerCase().includes('color');

                                        return (
                                            <div key={name} className="space-y-5">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-[14px] font-medium text-gray-900 capitalize">{name}: <span className="text-primary ml-1">{selectedAttributes[name]}</span></p>
                                                </div>
                                                <div className="flex flex-wrap gap-4">
                                                    {values.map((val: any) => (
                                                        isColor ? (
                                                            <button
                                                                key={val}
                                                                onClick={() => setSelectedAttributes({ ...selectedAttributes, [name]: val })}
                                                                title={val}
                                                                className={`w-10 h-10 rounded-full border-2 transition-all p-0.5 shadow-sm hover:scale-110 active:scale-95 ${selectedAttributes[name] === val ? 'border-primary ring-4 ring-primary/5' : 'border-gray-100'}`}
                                                            >
                                                                <div
                                                                    className="w-full h-full rounded-full border border-black/5"
                                                                    style={{ backgroundColor: val.toLowerCase() === 'black' ? '#000' : val.toLowerCase() === 'white' ? '#fff' : val }}
                                                                ></div>
                                                            </button>
                                                        ) : (
                                                            <button
                                                                key={val}
                                                                onClick={() => setSelectedAttributes({ ...selectedAttributes, [name]: val })}
                                                                className={`px-6 py-2.5 rounded-xl text-[11px] font-normal transition-all border tracking-wide ${selectedAttributes[name] === val
                                                                    ? 'bg-primary border-primary text-white'
                                                                    : 'bg-white border-gray-100 text-gray-500 hover:border-primary/30 hover:text-primary'
                                                                    }`}
                                                            >
                                                                {val}
                                                            </button>
                                                        )
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    });
                                })()}
                            </div>
                        )}

                        {/* Add-ons (Complementos) */}
                        {product.addons && (() => {
                            let addonsList = [];
                            try {
                                addonsList = typeof product.addons === 'string' ? JSON.parse(product.addons) : product.addons;
                            } catch (e) {
                                return null;
                            }

                            if (!addonsList || addonsList.length === 0) return null;

                            return (
                                <div className="space-y-10 py-2 border-t border-gray-50 pt-8 mt-4">
                                    {addonsList.map((addon: any) => (
                                        <div key={addon.attributeId} className="space-y-5">
                                            <p className="text-[14px] font-medium text-gray-900 capitalize">
                                                {addon.name} <span className="text-[11px] opacity-40 ml-2 font-normal">(opcional)</span>
                                            </p>
                                            <div className="flex flex-wrap gap-3">
                                                {addon.terms.map((term: string) => {
                                                    const isSelected = selectedAddons[addon.name]?.includes(term);
                                                    return (
                                                        <button
                                                            key={term}
                                                            onClick={() => {
                                                                const current = selectedAddons[addon.name] || [];
                                                                const updated = current.includes(term)
                                                                    ? current.filter(t => t !== term)
                                                                    : [...current, term];
                                                                setSelectedAddons({ ...selectedAddons, [addon.name]: updated });
                                                            }}
                                                            className={`px-5 py-2.5 rounded-xl text-[11px] font-normal transition-all border tracking-wide flex items-center gap-3 ${isSelected
                                                                ? 'bg-[#23553d] border-[#23553d] text-white'
                                                                : 'bg-white border-gray-100 text-gray-500 hover:border-primary/30 hover:text-primary shadow-sm'
                                                                }`}
                                                        >
                                                            <div className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center transition-colors ${isSelected ? 'bg-white border-white' : 'bg-gray-50 border-gray-200'}`}>
                                                                {isSelected && <CheckCircle2 className="h-2.5 w-2.5 text-[#23553d]" />}
                                                            </div>
                                                            {term}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            );
                        })()}

                        {/* Description (Text) at the bottom */}
                        {(product.description || product.content) && (
                            <div className="pt-6">
                                <p className="text-gray-600 text-[15px] leading-relaxed font-light max-w-lg">
                                    {product.description || product.content}
                                </p>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-6 pt-8 border-t border-gray-50 items-start sm:items-center justify-between">
                            <div className="flex gap-4">
                                <button className="h-14 w-14 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-gray-300 hover:text-rose-400 hover:border-rose-100 transition-all group">
                                    <Heart className="h-5 w-5 transition-transform group-hover:scale-110" />
                                </button>
                                <button className="h-14 w-14 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-gray-300 hover:text-primary hover:border-primary/20 transition-all group">
                                    <Share2 className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Social Share Section - Simplified */}
                            <div className="flex items-center gap-6">
                                <span className="text-[10px] xl:text-[11px] font-normal text-gray-400 capitalize">Compartir</span>
                                <div className="flex items-center gap-4">
                                    {[Mail, Facebook, Instagram].map((Icon, i) => (
                                        <button key={i} className="text-gray-400 hover:text-primary transition-colors">
                                            <Icon className="h-4 w-4" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
