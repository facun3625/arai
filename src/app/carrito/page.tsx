"use client";

import { useCartStore } from "@/store/useCartStore";
import {
    ShoppingBag,
    Trash2,
    Minus,
    Plus,
    ChevronLeft,
    ArrowRight,
    Truck,
    ShieldCheck,
    CreditCard
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CarritoPage() {
    const items = useCartStore((state) => state.items);
    const removeItem = useCartStore((state) => state.removeItem);
    const updateQuantity = useCartStore((state) => state.updateQuantity);
    const clearCart = useCartStore((state) => state.clearCart);
    const [freeShippingThreshold, setFreeShippingThreshold] = useState<number | null>(null);
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
        const fetchSettings = async () => {
            try {
                const res = await fetch("/api/settings");
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.freeShippingThreshold > 0) {
                        setFreeShippingThreshold(data.freeShippingThreshold);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch settings for cart", error);
            }
        };
        fetchSettings();
    }, []);

    if (!mounted) return null;

    const subtotal = items.reduce((total, item) => {
        const price = Number(item.price);
        return total + (isNaN(price) ? 0 : price) * item.quantity;
    }, 0);

    const total = subtotal;

    if (items.length === 0) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center bg-white px-4 font-montserrat">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-8 animate-bounce transition-all duration-1000">
                    <ShoppingBag className="h-10 w-10 text-gray-200" />
                </div>
                <h1 className="text-3xl font-light text-gray-900 mb-4 tracking-tight">Tu carrito está vacío</h1>
                <p className="text-gray-400 text-sm mb-12 max-w-xs text-center leading-relaxed">
                    Parece que aún no has añadido nada a tu selección Araí. Explora nuestra tienda y descubre el sabor de la tradición.
                </p>
                <Link
                    href="/tienda"
                    className="bg-primary text-white h-14 px-12 rounded-2xl font-bold text-[13px] uppercase tracking-widest flex items-center justify-center transition-all hover:-translate-y-1 hover:shadow-xl active:scale-95"
                >
                    ir a la tienda
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-[#fafafa] min-h-screen font-montserrat pb-24">
            <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6 pb-20">
                {/* Breadcrumbs */}
                <nav className="mb-12 flex items-center gap-3 text-[10px] xl:text-[11px] font-normal text-gray-500">
                    <Link href="/" className="hover:text-primary transition-colors capitalize">Inicio</Link>
                    <span className="text-gray-200">/</span>
                    <Link href="/tienda" className="hover:text-primary transition-colors capitalize">Tienda</Link>
                    <span className="text-gray-200">/</span>
                    <span className="text-gray-900 font-medium capitalize">Carrito</span>
                </nav>

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                    <div className="space-y-2">
                        <h1 className="text-4xl md:text-5xl font-light text-gray-900 tracking-tight">Tu Carrito <span className="text-gray-200 font-extralight ml-2">({items.length})</span></h1>
                    </div>

                    <button
                        onClick={clearCart}
                        className="text-[10px] xl:text-[11px] font-normal text-rose-400 hover:text-rose-600 capitalize transition-colors flex items-center gap-2"
                    >
                        <Trash2 className="h-3.5 w-3.5" /> vaciar carrito
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
                    {/* Items List */}
                    <div className="lg:col-span-2 space-y-6">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className="bg-white rounded-[32px] p-6 md:p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-8 transition-all hover:shadow-md group"
                            >
                                {/* Image */}
                                <div className="w-32 h-32 bg-[#fafafa] rounded-2xl overflow-hidden flex-shrink-0 border border-gray-50">
                                    {item.image ? (
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[8px] uppercase tracking-widest text-gray-200 font-bold">Sin imagen</div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-grow space-y-2 text-center md:text-left">
                                    <h3 className="text-xl font-medium text-gray-900">{item.name}</h3>
                                    {item.variant && (
                                        <div className="flex flex-wrap justify-center md:justify-start gap-2">
                                            {(() => {
                                                let validAttrs: [string, string][] = [];
                                                try {
                                                    let parsed = item.variant;
                                                    // Unwrap strings until it's an object or primitive
                                                    while (typeof parsed === 'string') {
                                                        try { parsed = JSON.parse(parsed); } catch { break; }
                                                    }

                                                    let finalObj = null;
                                                    // Extract the actual attributes object
                                                    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                                                        if ('attributes' in parsed) {
                                                            let inner = (parsed as any).attributes;
                                                            while (typeof inner === 'string') {
                                                                try { inner = JSON.parse(inner); } catch { break; }
                                                            }
                                                            if (inner && typeof inner === 'object' && !Array.isArray(inner)) {
                                                                finalObj = inner;
                                                            }
                                                        } else {
                                                            finalObj = parsed;
                                                        }
                                                    }

                                                    // Map and sanitize the object
                                                    if (finalObj && typeof finalObj === 'object' && !Array.isArray(finalObj)) {
                                                        const blockedKeys = ['id', 'productId', 'price', 'compareAtPrice', 'stock', 'sku', 'images', 'attributes', 'createdAt', 'updatedAt'];
                                                        for (const [key, value] of Object.entries(finalObj)) {
                                                            // Strictest checks: no numeric index keys, no internal keys, value must be printable
                                                            if (!blockedKeys.includes(key) && !/^\d+$/.test(key) && value !== null && typeof value !== 'object') {
                                                                validAttrs.push([key, String(value)]);
                                                            }
                                                        }
                                                    }
                                                } catch (e) {
                                                    // Corrupted data, ignore
                                                }

                                                return validAttrs.map(([key, value]) => (
                                                    <span key={key} className="text-[10px] xl:text-[11px] font-normal text-gray-400 capitalize bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                                                        {key}: {value}
                                                    </span>
                                                ));
                                            })()}
                                        </div>
                                    )}

                                    {item.addons && typeof item.addons === 'object' && Object.keys(item.addons).length > 0 && (
                                        <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-1">
                                            {Object.entries(item.addons)
                                                .filter(([name]) => !/^\d+$/.test(name)) // Block sequential character mapping
                                                .map(([name, terms]) => {
                                                    const termsArray = Array.isArray(terms) ? terms : (typeof terms === 'string' ? [terms] : []);
                                                    return termsArray.length > 0 && (
                                                        <div key={name} className="flex flex-wrap gap-1 items-center">
                                                            <span className="text-[9px] text-gray-300 uppercase tracking-tighter mr-1">{name}:</span>
                                                            {termsArray.map((term: string) => (
                                                                <span key={term} className="text-[10px] font-medium text-primary/70 bg-primary/5 px-2 py-0.5 rounded-md border border-primary/10">
                                                                    {term}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    )}
                                </div>

                                {/* Controls & Price */}
                                <div className="flex flex-col items-center md:items-end gap-6 w-full md:w-auto">
                                    <div className="flex items-center bg-[#fafafa] p-1 rounded-xl border border-gray-100">
                                        <button
                                            onClick={() => {
                                                if (item.quantity === 1) {
                                                    removeItem(item.id);
                                                } else {
                                                    updateQuantity(item.id, item.quantity - 1);
                                                }
                                            }}
                                            className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-primary transition-all hover:bg-white rounded-lg"
                                        >
                                            <Minus className="h-4 w-4" />
                                        </button>
                                        <span className="w-10 text-center font-medium text-[14px] text-gray-600">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-primary transition-all hover:bg-white rounded-lg"
                                        >
                                            <Plus className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl md:text-2xl font-light text-gray-900 tracking-tighter">$ {(Number(item.price) * item.quantity).toLocaleString('es-AR')}</p>
                                        <p className="text-[10px] xl:text-[11px] font-normal text-gray-400 capitalize mb-4">$ {Number(item.price).toLocaleString('es-AR')} c/u</p>

                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="text-[10px] xl:text-[11px] font-normal text-rose-400 hover:text-rose-600 capitalize transition-colors flex items-center gap-1.5 ml-auto"
                                        >
                                            <Trash2 className="h-3 w-3" /> quitar del carrito
                                        </button>
                                    </div>
                                </div>

                                <button
                                    onClick={() => removeItem(item.id)}
                                    className="md:hidden text-rose-500 text-[10px] font-bold uppercase tracking-widest mt-4"
                                >
                                    Eliminar
                                </button>
                                <button
                                    onClick={() => removeItem(item.id)}
                                    className="hidden md:flex absolute top-4 right-4 w-9 h-9 bg-white border border-gray-100 rounded-full items-center justify-center text-gray-400 hover:text-rose-500 hover:border-rose-100 transition-all shadow-sm z-10"
                                    title="Eliminar producto"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Summary */}
                    <div className="space-y-8">
                        <div className="bg-white rounded-[40px] p-10 border border-gray-100 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)] space-y-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] -z-0"></div>

                            <h2 className="text-2xl font-light text-gray-900 tracking-tight relative z-10">Resumen de Compra</h2>

                            <div className="space-y-5 relative z-10">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400 text-[10px] xl:text-[11px] font-normal capitalize">Subtotal (sin envío)</span>
                                    <span className="text-gray-900 font-medium">$ {subtotal.toLocaleString('es-AR')}</span>
                                </div>

                                <div className="h-px bg-gray-100 my-4 w-full"></div>

                                <div className="flex justify-between items-end">
                                    <span className="text-gray-900 text-[11px] xl:text-[12px] font-medium capitalize">Total Parcial</span>
                                    <span className="text-4xl font-light text-primary tracking-tighter">$ {total.toLocaleString('es-AR')}</span>
                                </div>

                                {/* Free Shipping Progress Map */}
                                {freeShippingThreshold !== null && (
                                    <div className="pt-4 border-t border-gray-100">
                                        <div className="flex justify-between items-end mb-2">
                                            <span className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">
                                                {total >= freeShippingThreshold ? "¡Envío Gratis Desbloqueado!" : "Te falta para envío gratis:"}
                                            </span>
                                            {total < freeShippingThreshold && (
                                                <span className="text-[11px] font-bold text-primary">
                                                    $ {(freeShippingThreshold - total).toLocaleString('es-AR')}
                                                </span>
                                            )}
                                        </div>
                                        <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-1000 ease-out rounded-full ${total >= freeShippingThreshold ? "bg-green-500" : "bg-primary"}`}
                                                style={{ width: `${Math.min((total / freeShippingThreshold) * 100, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => router.push('/checkout')}
                                className="w-full h-16 bg-[#0c120e] hover:bg-black text-white rounded-2xl font-medium text-[13px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl transition-all hover:-translate-y-1 active:scale-95 group"
                            >
                                ingresar datos de envío <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-2" />
                            </button>

                            <p className="text-[9px] text-gray-300 text-center uppercase tracking-widest leading-relaxed">
                                Podrás calcular el envío y elegir el método de pago en el siguiente paso.
                            </p>
                        </div>

                        {/* Benefits card */}
                        <div className="grid grid-cols-1 gap-4">
                            <div className="bg-white p-6 rounded-[24px] border border-gray-100 flex items-center gap-5 shadow-sm group hover:border-primary/20 transition-all">
                                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                                    <ShieldCheck className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-[11px] font-bold text-gray-900 uppercase">Compra Segura</p>
                                    <p className="text-[10px] text-gray-400">Protección de datos garantizada</p>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-[24px] border border-gray-100 flex items-center gap-5 shadow-sm group hover:border-primary/20 transition-all">
                                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                                    <CreditCard className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-[11px] font-bold text-gray-900 uppercase">Múltiples Pagos</p>
                                    <p className="text-[10px] text-gray-400">Crédito, Débito y Transferencia</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
