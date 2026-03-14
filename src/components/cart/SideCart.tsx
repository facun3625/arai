"use client";

import { useCartStore } from "@/store/useCartStore";
import { X, ShoppingBag, Trash2, Minus, Plus, ArrowRight, Truck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export const SideCart = () => {
    const { items, isOpen, closeDrawer, removeItem, updateQuantity } = useCartStore();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const subtotal = items.reduce((total, item) => {
        const price = Number(item.price);
        return total + (isNaN(price) ? 0 : price) * item.quantity;
    }, 0);

    const handleCheckout = () => {
        closeDrawer();
        router.push("/checkout");
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeDrawer}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-full max-w-[450px] bg-white z-[101] shadow-2xl flex flex-col font-montserrat"
                    >
                        {/* Header */}
                        <div className="p-6 md:p-8 flex items-center justify-between border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-xl">
                                    <ShoppingBag className="h-5 w-5 text-primary" />
                                </div>
                                <h2 className="text-xl font-light text-gray-900 tracking-tight">Tu Carrito</h2>
                                <span className="text-[11px] text-gray-400 font-medium ml-1">({items.length} items)</span>
                            </div>
                            <button
                                onClick={closeDrawer}
                                className="p-2 hover:bg-gray-50 rounded-full transition-colors text-gray-400 hover:text-gray-900"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Items List */}
                        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 scrollbar-hide">
                            {items.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center animate-pulse">
                                        <ShoppingBag className="h-8 w-8 text-gray-200" />
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-gray-900">Tu carrito está vacío</p>
                                        <p className="text-[11px] text-gray-400 leading-relaxed uppercase tracking-widest px-8">
                                            ¡Agregá algo para comenzar tu experiencia Araí!
                                        </p>
                                    </div>
                                    <button
                                        onClick={closeDrawer}
                                        className="text-[11px] font-bold text-primary uppercase tracking-widest hover:underline"
                                    >
                                        continuar comprando
                                    </button>
                                </div>
                            ) : (
                                items.map((item) => (
                                    <div key={item.id} className="flex gap-4 group">
                                        <div className="w-24 h-24 bg-gray-50 rounded-2xl overflow-hidden flex-shrink-0 border border-gray-100">
                                            <img
                                                src={item.image || "/placeholder-product.png"}
                                                alt={item.name}
                                                className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700"
                                            />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex justify-between items-start">
                                                <h3 className="text-sm font-medium text-gray-900 line-clamp-1">{item.name}</h3>
                                                <button
                                                    onClick={() => removeItem(item.id)}
                                                    className="p-1 text-gray-300 hover:text-rose-500 transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                            {item.variant && (
                                                <p className="text-[10px] text-gray-400 capitalize">
                                                    {typeof item.variant === 'string' ? item.variant : 'Selección especial'}
                                                </p>
                                            )}
                                            <div className="flex items-center justify-between pt-3">
                                                <div className="flex items-center bg-gray-50 rounded-lg border border-gray-100 p-0.5">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-primary transition-colors"
                                                    >
                                                        <Minus className="h-3 w-3" />
                                                    </button>
                                                    <span className="w-7 text-center text-xs font-medium">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-primary transition-colors"
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                    </button>
                                                </div>
                                                <p className="text-[15px] font-medium text-gray-900 tracking-tighter">
                                                    $ {(item.price * item.quantity).toLocaleString('es-AR')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        {items.length > 0 && (
                            <div className="p-6 md:p-8 space-y-6 border-t border-gray-100 bg-gray-50/30">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">Subtotal</span>
                                        <span className="text-xl font-light text-gray-900 tracking-tighter">
                                            $ {subtotal.toLocaleString('es-AR')}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 py-2 px-3 bg-white rounded-xl border border-gray-100">
                                        <Truck className="h-4 w-4 text-primary" />
                                        <span className="text-[10px] text-gray-500 font-medium">El envío se calcula en el checkout</span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <button
                                        onClick={handleCheckout}
                                        className="w-full h-14 bg-primary hover:bg-[#1a3f2d] text-white rounded-2xl font-bold text-[12px] uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl shadow-primary/20 active:scale-95 group"
                                    >
                                        finalizar compra <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </button>
                                    <Link
                                        href="/carrito"
                                        onClick={closeDrawer}
                                        className="w-full h-14 bg-white border border-gray-200 text-gray-900 rounded-2xl font-bold text-[11px] uppercase tracking-widest flex items-center justify-center transition-all hover:bg-gray-50"
                                    >
                                        ver carrito completo
                                    </Link>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
