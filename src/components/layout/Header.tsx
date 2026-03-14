"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, User, Facebook, Instagram, Twitter, Menu, ChevronDown, LogOut, LayoutDashboard } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { AuthModal } from "@/components/auth/AuthModal";
import { useRouter } from "next/navigation";

export const Header = () => {
    const [mounted, setMounted] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [bankDiscount, setBankDiscount] = useState<number | null>(null);
    const { user, isAuthenticated, logout } = useAuthStore();
    const items = useCartStore((state) => state.items);
    const itemCount = items.reduce((count, item) => count + item.quantity, 0);
    const totalPrice = items.reduce((total, item) => {
        const price = Number(item.price);
        return total + (isNaN(price) ? 0 : price) * item.quantity;
    }, 0);

    useEffect(() => {
        setMounted(true);
        const fetchSettings = async () => {
            try {
                const res = await fetch("/api/settings");
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.bankTransferDiscount !== undefined) {
                        setBankDiscount(data.bankTransferDiscount);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch settings for header", error);
            }
        };
        fetchSettings();

        const handleSettingsUpdated = () => fetchSettings();
        window.addEventListener("settings-updated", handleSettingsUpdated);
        return () => window.removeEventListener("settings-updated", handleSettingsUpdated);
    }, []);

    return (
        <>
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
            />
            {/* 1. Black Top Bar (SCROLLS AWAY) */}
            <div className="bg-[#1a1a1a] text-white py-2 font-montserrat relative z-40">
                <div className="max-w-7xl mx-auto px-4 lg:px-8 flex items-center justify-between">
                    {/* ... rest of top bar remains same ... */}
                    <div className="flex gap-2">
                        <Link href="/franquicias" className="bg-[#23553D]/40 hover:bg-[#23553D] text-[9px] font-bold px-4 py-1.5 rounded-full border border-white/10 transition-all uppercase">
                            Franquicias
                        </Link>
                        <Link href="/mayoristas" className="bg-[#23553D]/40 hover:bg-[#23553D] text-[9px] font-bold px-4 py-1.5 rounded-full border border-white/10 transition-all uppercase">
                            Mayoristas
                        </Link>
                    </div>

                    <div className="hidden md:block text-[9px] font-bold text-white/90">
                        {bankDiscount !== null && bankDiscount > 0 ? `${bankDiscount}% POR TRANSF. BANCARIA` : ""}
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-[9px] font-bold text-white/70">
                            <span className="flex items-center gap-1 cursor-pointer hover:text-white uppercase">English</span>
                            <span className="text-white/20">|</span>
                            <span className="flex items-center gap-1 cursor-pointer hover:text-white text-white uppercase">Español</span>
                        </div>
                        <div className="flex items-center gap-2 border-l border-white/10 pl-4">
                            <Facebook className="h-3.5 w-3.5 text-white/70 hover:text-white cursor-pointer" />
                            <Instagram className="h-3.5 w-3.5 text-white/70 hover:text-white cursor-pointer" />
                            <Twitter className="h-3.5 w-3.5 text-white/70 hover:text-white cursor-pointer" />
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Sticky Compact Header (Green Section ONLY) */}
            <header className="sticky top-0 z-50 bg-primary shadow-xl py-1 transform-gpu font-montserrat">
                <div className="max-w-7xl mx-auto px-4 lg:px-8">
                    <div className="flex items-center justify-between h-14 md:h-16 gap-4">

                        {/* Left: Logo (Smaller) */}
                        <Link href="/" className="relative w-24 h-8 md:w-28 md:h-10 flex-shrink-0 transition-transform hover:scale-105">
                            <Image
                                src="/arai_logo.png"
                                alt="araí yerba mate"
                                fill
                                className="object-contain"
                                priority
                            />
                        </Link>

                        {/* Center: Inline Navigation + Tienda ... */}
                        <nav className="hidden lg:flex items-center gap-4 xl:gap-6">
                            {[
                                { name: 'Inicio', href: '/' },
                                { name: 'Proceso Productivo', href: '/proceso' },
                                { name: 'Videos', href: '/videos' },
                                { name: 'Cómo Comprar', href: '/como-comprar' },
                                { name: 'Contacto', href: '/contacto' },
                                { name: 'Tienda', href: '/tienda', isButton: true },
                            ].map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={
                                        item.isButton
                                            ? "bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full text-[10px] xl:text-[11px] font-normal flex items-center gap-2 transition-all border border-white/15 whitespace-nowrap !normal-case"
                                            : "text-[10px] xl:text-[11px] font-normal text-white/90 hover:text-white transition-colors whitespace-nowrap !normal-case"
                                    }
                                    style={{ textTransform: 'capitalize' }}
                                >
                                    {item.isButton ? (
                                        <>
                                            <ShoppingBag className="h-3.5 w-3.5" />
                                            <span>{item.name}</span>
                                        </>
                                    ) : (
                                        item.name
                                    )}
                                </Link>
                            ))}
                        </nav>

                        {/* Right: Actions (Simplified) */}
                        <div className="flex items-center gap-4 md:gap-5">
                            {/* User Menu / Login */}
                            <div className="relative group/user">
                                {mounted && isAuthenticated && user ? (
                                    <div className="flex items-center gap-2 cursor-pointer py-1">
                                        <span className="text-[10px] xl:text-[11px] font-normal text-white/90 lowercase">
                                            {user.name.split(' ')[0]}
                                        </span>
                                        <div className="bg-white/10 p-1.5 rounded-full border border-white/10 group-hover/user:bg-white/20 transition-all cursor-pointer">
                                            <User className="h-4 w-4 text-white" />
                                        </div>
                                        <ChevronDown className="h-3 w-3 text-white/50 group-hover/user:text-white transition-colors" />

                                        {/* Dropdown Menu */}
                                        <div className="absolute right-0 top-[calc(100%+8px)] w-52 bg-[#0c120e] border border-white/5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] py-3 opacity-0 invisible group-hover/user:opacity-100 group-hover/user:visible transition-all duration-300 transform origin-top-right scale-95 group-hover/user:scale-100 z-50 backdrop-blur-xl">
                                            <div className="px-4 py-2 mb-2 border-b border-white/5">
                                                <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">mi cuenta</p>
                                            </div>

                                            {user.role === 'ADMIN' && (
                                                <Link
                                                    href="/admin/dashboard"
                                                    className="flex items-center gap-3 px-4 py-2.5 text-[11.5px] text-white/70 hover:text-white hover:bg-white/5 transition-all group/item"
                                                >
                                                    <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center group-hover/item:bg-primary transition-colors">
                                                        <LayoutDashboard className="h-3.5 w-3.5 text-primary group-hover:text-white transition-colors" />
                                                    </div>
                                                    <span>Ir a Dashboard</span>
                                                </Link>
                                            )}
                                            <Link
                                                href="/mi-cuenta"
                                                className="flex items-center gap-3 px-4 py-2.5 text-[11.5px] text-white/70 hover:text-white hover:bg-white/5 transition-all group/item"
                                            >
                                                <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center group-hover/item:bg-primary transition-colors">
                                                    <User className="h-3.5 w-3.5 text-primary group-hover:text-white transition-colors" />
                                                </div>
                                                <span>Mi Panel</span>
                                            </Link>

                                            <div className="mt-2 pt-2 border-t border-white/5">
                                                <button
                                                    onClick={() => logout()}
                                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-[11.5px] text-red-400/70 hover:text-red-400 hover:bg-red-400/5 transition-all group/logout"
                                                >
                                                    <div className="w-6 h-6 rounded-lg bg-red-400/5 flex items-center justify-center group-hover/logout:bg-red-400 transition-colors">
                                                        <LogOut className="h-3.5 w-3.5 text-red-400 group-hover:text-white transition-colors" />
                                                    </div>
                                                    <span>Cerrar Sesión</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setIsAuthModalOpen(true)}
                                        className="flex items-center gap-2 text-white/80 hover:text-white transition-colors p-1 cursor-pointer"
                                    >
                                        <span className="text-[10px] xl:text-[11px] font-normal lowercase">
                                            ingresar
                                        </span>
                                        <div className="bg-white/10 p-1.5 rounded-full border border-white/10 hover:bg-white/20 transition-all">
                                            <User className="h-4 w-4" />
                                        </div>
                                    </button>
                                )}
                            </div>

                            <Link href="/carrito" className="flex items-center gap-3 group px-1 cursor-pointer">
                                <span className="hidden md:inline text-[10px] xl:text-[11px] font-normal text-white">
                                    {mounted ? `$ ${totalPrice.toLocaleString('es-AR')}` : ""}
                                </span>
                                <div className="relative">
                                    <ShoppingBag className="h-5.5 w-5.5 text-white" />
                                    {mounted && itemCount > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-white text-primary text-[9px] font-black h-4.5 w-4.5 rounded-full flex items-center justify-center shadow-lg border border-primary/10">
                                            {itemCount}
                                        </span>
                                    )}
                                </div>
                            </Link>

                            {/* Mobile Menu Toggle */}
                            <button className="lg:hidden text-white/80 p-1 cursor-pointer">
                                <Menu className="h-6 w-6" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>
        </>
    );
};
