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
    CreditCard,
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
import { useAuthStore } from "@/store/useAuthStore";
import { trackPixelEvent } from "@/lib/fbPixel";
import Link from "next/link";

export default function ProductDetailClient() {
    const { slug } = useParams();
    const router = useRouter();
    const [product, setProduct] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedVariant, setSelectedVariant] = useState<any>(null);
    const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
    const [quantity, setQuantity] = useState(1);
    const [activeImage, setActiveImage] = useState("");
    const [selectedAddons, setSelectedAddons] = useState<Record<string, string[]>>({});
    const [addonMeta, setAddonMeta] = useState<Record<string, { maxSelections?: number; blocksAttributeId?: string; required?: boolean }>>({});
    const addItem = useCartStore((state) => state.addItem);
    const cartItems = useCartStore((state) => state.items);
    const { user, isAuthenticated } = useAuthStore();
    const [storeInfo, setStoreInfo] = useState<{ bankTransferDiscount: number; freeShippingThreshold: number }>({ bankTransferDiscount: 0, freeShippingThreshold: 0 });
    const [reviews, setReviews] = useState<any[]>([]);
    const [reviewsAverage, setReviewsAverage] = useState(0);
    const [reviewsCount, setReviewsCount] = useState(0);
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [reviewMessage, setReviewMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

    const fetchReviews = async (productId: string) => {
        try {
            const res = await fetch(`/api/reviews?productId=${productId}`);
            if (res.ok) {
                const data = await res.json();
                setReviews(data.reviews || []);
                setReviewsAverage(data.average || 0);
                setReviewsCount(data.count || 0);
            }
        } catch { /* ignore */ }
    };

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!product) return;
        setIsSubmittingReview(true);
        setReviewMessage(null);
        try {
            const res = await fetch("/api/reviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productId: product.id, rating: reviewForm.rating, comment: reviewForm.comment }),
            });
            const data = await res.json();
            if (res.ok) {
                setReviewMessage({ text: data.message || "¡Gracias por tu reseña!", type: "success" });
                setReviewForm({ rating: 5, comment: "" });
            } else {
                setReviewMessage({ text: data.error || "No pudimos guardar tu reseña.", type: "error" });
            }
        } catch {
            setReviewMessage({ text: "Error de conexión. Intentá de nuevo.", type: "error" });
        } finally {
            setIsSubmittingReview(false);
        }
    };

    useEffect(() => {
        fetch("/api/settings")
            .then((res) => res.ok ? res.json() : null)
            .then((data) => {
                if (data) {
                    setStoreInfo({
                        bankTransferDiscount: Number(data.bankTransferDiscount) || 0,
                        freeShippingThreshold: Number(data.freeShippingThreshold) || 0,
                    });
                }
            })
            .catch(() => {});
    }, []);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await fetch(`/api/products?slug=${slug}`);
                if (res.ok) {
                    const data = await res.json();
                    setProduct(data);

                    trackPixelEvent('ViewContent', {
                        content_ids: [data.id],
                        content_type: 'product',
                        content_name: data.name,
                        value: Number(data.price) || 0,
                        currency: 'ARS'
                    });

                    // Parse images safely
                    let pImages = [];
                    try {
                        pImages = typeof data.images === 'string' ? JSON.parse(data.images) : (data.images || []);
                    } catch (e) {
                        // ignore parsing error
                        pImages = [];
                    }

                    setActiveImage(data.featuredImage || pImages[0] || "");

                    // Load addon restrictions
                    try {
                        const attrRes = await fetch("/api/attributes");
                        if (attrRes.ok) {
                            const attrs = await attrRes.json();
                            const meta: Record<string, { maxSelections?: number; blocksAttributeId?: string; required?: boolean }> = {};
                            attrs.forEach((a: any) => {
                                meta[a.id] = { maxSelections: a.maxSelections, blocksAttributeId: a.blocksAttributeId, required: a.required };
                            });
                            setAddonMeta(meta);
                        }
                    } catch { /* ignore */ }

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

    useEffect(() => {
        if (product?.id) fetchReviews(product.id);
    }, [product?.id]);

    // Update variant matching when attributes change
    useEffect(() => {
        if (product?.type === "VARIABLE" && product.variants?.length > 0) {
            let firstAttrs: Record<string, any> = {};
            try {
                const fv = product.variants[0];
                firstAttrs = typeof fv.attributes === 'string' ? JSON.parse(fv.attributes) : (fv.attributes || {});
            } catch (e) {
                // ignore
            }
            const requiredNames = Object.keys(firstAttrs);
            const hasAllSelections = requiredNames.length > 0 && requiredNames.every((name) => selectedAttributes[name] !== undefined);

            const match = hasAllSelections
                ? product.variants.find((v: any) => {
                    let vAttrs: Record<string, any> = {};
                    try {
                        vAttrs = typeof v.attributes === 'string' ? JSON.parse(v.attributes) : (v.attributes || {});
                    } catch (e) {
                        // ignore
                    }

                    return requiredNames.every((key) => vAttrs[key] === selectedAttributes[key]);
                })
                : null;

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

    const getMissingRequiredAddons = (): string[] => {
        if (!product?.addons) return [];
        let addonsList: any[] = [];
        try {
            addonsList = typeof product.addons === 'string' ? JSON.parse(product.addons) : product.addons;
        } catch {
            return [];
        }

        // A group that another selection has blocked can't be selected — it's an alternative
        // to whatever blocked it, not an unmet requirement.
        const blockedGroups = new Set<string>();
        addonsList.forEach((addon: any) => {
            const meta = addonMeta[addon.attributeId];
            const hasSelection = (selectedAddons[addon.name] || []).length > 0;
            if (hasSelection && meta?.blocksAttributeId) {
                const blocked = addonsList.find((a: any) => a.attributeId === meta.blocksAttributeId);
                if (blocked) blockedGroups.add(blocked.name);
            }
        });

        return addonsList
            .filter((addon: any) =>
                addonMeta[addon.attributeId]?.required &&
                !blockedGroups.has(addon.name) &&
                (selectedAddons[addon.name] || []).length === 0
            )
            .map((addon: any) => addon.name);
    };

    const handleAddToCart = () => {
        if (product.type === "VARIABLE" && !selectedVariant) {
            alert("Por favor selecciona todas las opciones");
            return;
        }

        const missingRequiredAddons = getMissingRequiredAddons();
        if (missingRequiredAddons.length > 0) {
            alert(`Por favor elegí una opción para: ${missingRequiredAddons.join(', ')}`);
            return;
        }

        const basePrice = selectedVariant ? Number(selectedVariant.price) : Number(product.price);

        const itemToAdd = {
            id: selectedVariant ? `${product.id}-${selectedVariant.id}` : product.id,
            productId: product.id,
            variantId: selectedVariant?.id,
            name: product.name,
            price: isNaN(basePrice) ? 0 : basePrice,
            image: activeImage,
            variant: selectedVariant?.attributes,
            weight: selectedVariant?.weight ?? product.weight,
            addons: selectedAddons,
            quantity: quantity
        };

        addItem(itemToAdd);

        trackPixelEvent('AddToCart', {
            content_ids: [product.id],
            content_type: 'product',
            content_name: product.name,
            value: itemToAdd.price * quantity,
            currency: 'ARS',
            contents: [{ id: product.id, quantity }]
        });
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
    const needsVariantSelection = product.type === "VARIABLE" && !selectedVariant;
    const missingRequiredAddons = getMissingRequiredAddons();
    const needsMoreSelection = needsVariantSelection || missingRequiredAddons.length > 0;
    const availableStock = selectedVariant ? selectedVariant.stock : (product.type === "VARIABLE" ? null : product.stock);
    const isOutOfStock = availableStock !== null && availableStock <= 0;

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
                                {reviewsCount > 0 && (
                                    <>
                                        <span className="text-gray-200">|</span>
                                        <a href="#reseñas" className="flex items-center gap-1.5 text-gray-500 hover:text-primary transition-colors">
                                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                            <span className="font-medium">{reviewsAverage.toFixed(1)}</span>
                                            <span className="text-gray-400">({reviewsCount})</span>
                                        </a>
                                    </>
                                )}
                            </div>

                            <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-8 py-2">
                                <div className="flex items-baseline gap-3 min-w-[140px] md:min-w-[180px]">
                                    <span className="text-4xl font-light text-gray-900 tracking-tighter">$ {(basePrice * quantity).toLocaleString('es-AR')}</span>
                                    {compareAtPrice > basePrice && (
                                        <span className="text-[17px] text-gray-400 line-through font-light">$ {(compareAtPrice * quantity).toLocaleString('es-AR')}</span>
                                    )}
                                </div>

                                <div className="flex items-center gap-4 flex-wrap mt-2">
                                    {isOutOfStock ? (
                                        <div className="h-12 px-6 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-400 font-medium text-[12px] uppercase tracking-widest w-full">
                                            Sin stock disponible
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex items-center bg-gray-50 rounded-xl border border-gray-100 h-12">
                                                <button
                                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                    className="w-10 h-full flex items-center justify-center text-gray-400 hover:text-primary transition-all"
                                                >
                                                    <Minus className="h-4 w-4" />
                                                </button>
                                                <span className="w-10 text-center font-medium text-[14px] text-gray-600">{quantity}</span>
                                                <button
                                                    onClick={() => setQuantity(availableStock !== null ? Math.min(availableStock, quantity + 1) : quantity)}
                                                    disabled={availableStock === null || quantity >= availableStock}
                                                    className="w-10 h-full flex items-center justify-center text-gray-400 hover:text-primary transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </button>
                                            </div>

                                            <button
                                                onClick={handleAddToCart}
                                                disabled={isInCart || needsMoreSelection}
                                                title={needsMoreSelection ? "Selecciona todas las opciones antes de agregar al carrito" : undefined}
                                                className={`h-12 rounded-xl font-medium text-[12px] uppercase tracking-widest flex items-center justify-center gap-2.5 transition-all active:scale-95 px-6 ${isInCart
                                                    ? "bg-[#23553d]/20 text-[#23553d] border border-[#23553d]/10 cursor-default"
                                                    : needsMoreSelection
                                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                        : "bg-primary text-white shadow-md hover:-translate-y-0.5 hover:shadow-xl shadow-primary/10"
                                                    }`}
                                            >
                                                {isInCart ? <CheckCircle2 className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
                                                {isInCart ? "Ya en el Carrito" : needsMoreSelection ? "Elegí las opciones" : "Añadir al Carrito"}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Trust / shipping info next to the CTA */}
                        <div className="space-y-3 bg-gray-50/60 border border-gray-100 rounded-2xl p-5">
                            <div className="flex items-start gap-3">
                                <Truck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                <p className="text-[12.5px] text-gray-600 leading-relaxed">
                                    Envío a todo el país
                                    {storeInfo.freeShippingThreshold > 0 && (
                                        <> · gratis desde ${storeInfo.freeShippingThreshold.toLocaleString('es-AR')}</>
                                    )}. El costo exacto se calcula con tu código postal en el checkout.
                                </p>
                            </div>
                            <div className="flex items-start gap-3">
                                <CreditCard className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                <p className="text-[12.5px] text-gray-600 leading-relaxed">
                                    Mercado Pago
                                    {storeInfo.bankTransferDiscount > 0 && (
                                        <> o transferencia bancaria con {storeInfo.bankTransferDiscount}% de descuento</>
                                    )}.
                                </p>
                            </div>
                            <div className="flex items-start gap-3">
                                <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                <p className="text-[12.5px] text-gray-600 leading-relaxed">
                                    10 días para arrepentirte de tu compra.{" "}
                                    <Link href="/legales/devoluciones" className="text-primary underline">
                                        Ver cambios y devoluciones
                                    </Link>.
                                </p>
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
                                                    <p className="text-[14px] font-medium text-gray-900 capitalize">{name}: {selectedAttributes[name] ? (
                                                        <span className="text-primary ml-1">{selectedAttributes[name]}</span>
                                                    ) : (
                                                        <span className="text-gray-400 font-normal ml-1 normal-case">sin elegir</span>
                                                    )}</p>
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

                            // Build a map of which addon groups are blocked
                            const blockedGroups = new Set<string>();
                            addonsList.forEach((addon: any) => {
                                const meta = addonMeta[addon.attributeId];
                                const hasSelection = (selectedAddons[addon.name] || []).length > 0;
                                if (hasSelection && meta?.blocksAttributeId) {
                                    const blocked = addonsList.find((a: any) => a.attributeId === meta.blocksAttributeId);
                                    if (blocked) blockedGroups.add(blocked.name);
                                }
                            });

                            return (
                                <div className="space-y-10 py-2 border-t border-gray-50 pt-8 mt-4">
                                    {addonsList.map((addon: any) => {
                                        const meta = addonMeta[addon.attributeId];
                                        const isBlocked = blockedGroups.has(addon.name);
                                        const currentSelected = selectedAddons[addon.name] || [];
                                        const maxReached = meta?.maxSelections ? currentSelected.length >= meta.maxSelections : false;

                                        return (
                                            <div key={addon.attributeId} className={`space-y-5 transition-opacity ${isBlocked ? 'opacity-30 pointer-events-none' : ''}`}>
                                                <p className="text-[14px] font-medium text-gray-900 capitalize flex items-center gap-2">
                                                    {addon.name}
                                                    {meta?.required ? (
                                                        <span className="text-[11px] text-orange-500 font-normal">(obligatorio)</span>
                                                    ) : (
                                                        <span className="text-[11px] opacity-40 font-normal">(opcional)</span>
                                                    )}
                                                    {meta?.maxSelections && (
                                                        <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                                                            máx. {meta.maxSelections}
                                                        </span>
                                                    )}
                                                    {isBlocked && (
                                                        <span className="text-[10px] text-red-400">bloqueado</span>
                                                    )}
                                                </p>
                                                <div className="flex flex-wrap gap-3">
                                                    {addon.terms.map((term: string) => {
                                                        const isSelected = currentSelected.includes(term);
                                                        const isDisabled = isBlocked || (!isSelected && maxReached);
                                                        return (
                                                            <button
                                                                key={term}
                                                                disabled={isDisabled}
                                                                onClick={() => {
                                                                    if (isDisabled) return;
                                                                    const updated = isSelected
                                                                        ? currentSelected.filter(t => t !== term)
                                                                        : [...currentSelected, term];
                                                                    setSelectedAddons({ ...selectedAddons, [addon.name]: updated });
                                                                }}
                                                                className={`px-5 py-2.5 rounded-xl text-[11px] font-normal transition-all border tracking-wide flex items-center gap-3 ${
                                                                    isSelected
                                                                        ? 'bg-[#23553d] border-[#23553d] text-white'
                                                                        : isDisabled
                                                                            ? 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'
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
                                        );
                                    })}
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

                        {/* Reviews */}
                        <div id="reseñas" className="pt-8 border-t border-gray-50 space-y-8 scroll-mt-24">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-medium text-gray-900">Reseñas de clientes</h2>
                                {reviewsCount > 0 && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <div className="flex items-center gap-0.5">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <Star key={i} className={`h-4 w-4 ${i < Math.round(reviewsAverage) ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`} />
                                            ))}
                                        </div>
                                        <span className="text-gray-500">{reviewsAverage.toFixed(1)} · {reviewsCount} {reviewsCount === 1 ? "reseña" : "reseñas"}</span>
                                    </div>
                                )}
                            </div>

                            {reviews.length > 0 ? (
                                <div className="space-y-6">
                                    {reviews.map((review) => (
                                        <div key={review.id} className="border-b border-gray-50 pb-6 last:border-0">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-gray-900 text-[13px]">{review.authorName}</span>
                                                    {review.isVerified && (
                                                        <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-primary/70">
                                                            <ShieldCheck className="h-3 w-3" /> Compra verificada
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-0.5">
                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                        <Star key={i} className={`h-3 w-3 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`} />
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-gray-600 text-[14px] leading-relaxed">{review.comment}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-400 text-[13px]">Este producto todavía no tiene reseñas.</p>
                            )}

                            {isAuthenticated ? (
                                <form onSubmit={handleSubmitReview} className="bg-gray-50/60 border border-gray-100 rounded-2xl p-6 space-y-4">
                                    <p className="text-[13px] font-medium text-gray-900">Dejá tu reseña</p>
                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={() => setReviewForm(prev => ({ ...prev, rating: i + 1 }))}
                                                className="p-0.5"
                                            >
                                                <Star className={`h-5 w-5 transition-colors ${i < reviewForm.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`} />
                                            </button>
                                        ))}
                                    </div>
                                    <textarea
                                        required
                                        rows={3}
                                        value={reviewForm.comment}
                                        onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                                        placeholder="Contanos qué te pareció el producto..."
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                                    />
                                    {reviewMessage && (
                                        <p className={`text-[12px] font-medium ${reviewMessage.type === "success" ? "text-primary" : "text-red-500"}`}>
                                            {reviewMessage.text}
                                        </p>
                                    )}
                                    <button
                                        type="submit"
                                        disabled={isSubmittingReview || !reviewForm.comment.trim()}
                                        className="px-6 py-2.5 bg-primary text-white rounded-xl text-[12px] font-medium uppercase tracking-widest disabled:opacity-50 transition-all"
                                    >
                                        {isSubmittingReview ? "Enviando..." : "Publicar reseña"}
                                    </button>
                                </form>
                            ) : (
                                <p className="text-[13px] text-gray-400">
                                    <Link href="/mi-cuenta" className="text-primary underline">Iniciá sesión</Link> para dejar tu reseña.
                                </p>
                            )}
                        </div>

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
