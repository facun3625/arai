"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, User, Facebook, Instagram, Twitter, Menu, ChevronDown, LogOut, LayoutDashboard, X, Youtube } from "lucide-react";
import { TikTokIcon } from "@/components/icons/TikTokIcon";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { AuthModal } from "@/components/auth/AuthModal";

export const Header = () => {
    const [mounted, setMounted] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [bankDiscount, setBankDiscount] = useState<number | null>(null);
    const [socialLinks, setSocialLinks] = useState({
        instagramUrl: "",
        facebookUrl: "",
        xUrl: "",
        youtubeUrl: "",
        tiktokUrl: "",
        whatsappNumber: ""
    });

    const { user, isAuthenticated, logout } = useAuthStore();
    const items = useCartStore((state) => state.items);
    const openDrawer = useCartStore((state) => state.openDrawer);
    const itemCount = items.reduce((count, item) => count + item.quantity, 0);
    const totalPrice = items.reduce((total, item) => {
        const price = Number(item.price);
        return total + (isNaN(price) ? 0 : price) * item.quantity;
    }, 0);

    const logoutHandler = async () => {
        if (user?.provider === 'google') {
            const { signOut } = await import("next-auth/react");
            await signOut({ callbackUrl: "/" });
        } else {
            logout();
        }
    };

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
                    setSocialLinks({
                        instagramUrl: data.instagramUrl || "",
                        facebookUrl: data.facebookUrl || "",
                        xUrl: data.xUrl || "",
                        youtubeUrl: data.youtubeUrl || "",
                        tiktokUrl: data.tiktokUrl || "",
                        whatsappNumber: data.whatsappNumber || ""
                    });
                }
            } catch (error) {
                console.error("Failed to fetch settings for header", error);
            }
        };
        fetchSettings();

        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);

        const handleSettingsUpdated = () => fetchSettings();
        window.addEventListener("settings-updated", handleSettingsUpdated);

        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("settings-updated", handleSettingsUpdated);
        };
    }, []);

    return (
        <>
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
            />
            {/* 1. Black Top Bar */}
            <div className="bg-[#1a1a1a] text-white py-2 font-montserrat relative z-[60]">
                <div className="max-w-7xl mx-auto px-4 lg:px-8 flex items-center justify-between">
                    <div className="flex gap-2">
                        <Link href="/franquicias" className="bg-[#23553D]/40 hover:bg-[#23553D] text-[9px] font-bold px-4 py-1.5 rounded-full border border-white/10 transition-all uppercase">
                            Franquicias
                        </Link>
                        <Link href="/mayoristas" className="bg-[#23553D]/40 hover:bg-[#23553D] text-[9px] font-bold px-4 py-1.5 rounded-full border border-white/10 transition-all uppercase">
                            Mayoristas
                        </Link>
                    </div>

                    <div className="hidden md:block text-[9px] font-bold text-white/90">
                        {bankDiscount !== null && bankDiscount > 0 ? (
                            <>
                                <span className="text-primary font-black">{bankDiscount}%</span> POR TRANSF. BANCARIA
                            </>
                        ) : ""}
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-[9px] font-bold text-white/70">
                            <span className="flex items-center gap-1 cursor-pointer hover:text-white uppercase text-[9px]">English</span>
                            <span className="text-white/20">|</span>
                            <span className="flex items-center gap-1 cursor-pointer hover:text-white text-white uppercase text-[9px]">Español</span>
                        </div>
                        <div className="flex items-center gap-2 border-l border-white/10 pl-4">
                            {socialLinks.facebookUrl && (
                                <a href={socialLinks.facebookUrl} target="_blank" rel="noopener noreferrer">
                                    <Facebook className="h-3.5 w-3.5 text-white/70 hover:text-white cursor-pointer transition-colors" />
                                </a>
                            )}
                            {socialLinks.instagramUrl && (
                                <a href={socialLinks.instagramUrl} target="_blank" rel="noopener noreferrer">
                                    <Instagram className="h-3.5 w-3.5 text-white/70 hover:text-white cursor-pointer transition-colors" />
                                </a>
                            )}
                            {socialLinks.xUrl && (
                                <a href={socialLinks.xUrl} target="_blank" rel="noopener noreferrer">
                                    <Twitter className="h-3.5 w-3.5 text-white/70 hover:text-white cursor-pointer transition-colors" />
                                </a>
                            )}
                            {socialLinks.youtubeUrl && (
                                <a href={socialLinks.youtubeUrl} target="_blank" rel="noopener noreferrer">
                                    <Youtube className="h-3.5 w-3.5 text-white/70 hover:text-white cursor-pointer transition-colors" />
                                </a>
                            )}
                            {socialLinks.tiktokUrl && (
                                <a href={socialLinks.tiktokUrl} target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white cursor-pointer transition-colors">
                                    <TikTokIcon className="h-3.5 w-3.5" />
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Sticky Header */}
            <header
                className={`sticky top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                    ? "bg-primary shadow-xl py-2"
                    : "bg-primary py-4"
                    }`}
            >
                <div className="max-w-7xl mx-auto px-4 lg:px-8">
                    <nav className="flex items-center justify-between h-12 md:h-14">
                        {/* Left: Logo & Mobile Toggle */}
                        <div className="flex items-center gap-4">
                            <button
                                className="lg:hidden text-white p-1 hover:bg-white/10 rounded-lg transition-colors"
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                            >
                                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            </button>
                            <Link href="/" className="relative w-20 h-7 md:w-28 md:h-10 flex-shrink-0 transition-transform hover:scale-105">
                                <Image
                                    src="/arai_logo.png"
                                    alt="araí yerba mate"
                                    fill
                                    className="object-contain"
                                    priority
                                />
                            </Link>
                        </div>

                        {/* Center: Main Nav */}
                        <nav className="hidden lg:flex items-center gap-4 xl:gap-8 overflow-visible">
                            {[
                                { name: 'Inicio', href: '/' },
                                { name: 'Proceso Productivo', href: '/proceso' },
                                { name: 'Videos', href: '/videos' },
                                { name: 'Cómo Comprar', href: '/como-comprar' },
                                { name: 'Tienda', href: '/tienda', isButton: true },
                            ].map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={
                                        item.isButton
                                            ? "bg-white/10 hover:bg-white/20 text-white px-5 py-2 rounded-full text-[11px] font-medium flex items-center gap-2 transition-all border border-white/15 whitespace-nowrap"
                                            : "text-[11px] font-medium text-white/80 hover:text-white transition-colors whitespace-nowrap capitalize"
                                    }
                                >
                                    {item.isButton && <ShoppingBag className="h-3.5 w-3.5" />}
                                    <span>{item.name}</span>
                                </Link>
                            ))}
                        </nav>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-3 md:gap-5">
                            {/* User Section - Client Side Sensitive */}
                            <div className="relative group/user min-w-[32px] md:min-w-[40px] flex justify-end">
                                {mounted ? (
                                    <>
                                        {isAuthenticated && user ? (
                                            <div className="flex items-center gap-2 cursor-pointer py-1">
                                                <span className="hidden md:inline text-[10px] xl:text-[11px] font-normal text-white/90 lowercase">
                                                    {user.name.split(' ')[0]}
                                                </span>
                                                <div className="bg-white/10 p-1.5 rounded-full border border-white/10 group-hover/user:bg-white/20 transition-all">
                                                    <User className="h-4 w-4 text-white" />
                                                </div>
                                                <ChevronDown className="h-3 w-3 text-white/50 group-hover/user:text-white transition-colors" />

                                                {/* Dropdown Menu */}
                                                <div className="absolute right-0 top-[calc(100%+8px)] w-52 bg-white border border-gray-100 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] opacity-0 invisible group-hover/user:opacity-100 group-hover/user:visible transition-all duration-300 transform origin-top-right scale-95 group-hover/user:scale-100 z-[70] overflow-hidden">
                                                    <div className="p-3 bg-gray-50/50 border-b border-gray-100 text-left">
                                                        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">mi cuenta</p>
                                                    </div>

                                                    <div className="p-2 text-left">
                                                        {user.role === 'ADMIN' && (
                                                            <Link
                                                                href="/admin/dashboard"
                                                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[11.5px] text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all group/item mb-1"
                                                            >
                                                                <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center group-hover/item:bg-primary transition-colors">
                                                                    <LayoutDashboard className="h-3.5 w-3.5 text-primary group-hover/item:text-white transition-colors" />
                                                                </div>
                                                                <span>Ir a Dashboard</span>
                                                            </Link>
                                                        )}
                                                        {user.role !== 'ADMIN' && (
                                                            <Link
                                                                href="/mi-cuenta"
                                                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[11.5px] text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all group/item mb-1"
                                                            >
                                                                <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center group-hover/item:bg-primary transition-colors">
                                                                    <User className="h-3.5 w-3.5 text-primary group-hover/item:text-white transition-colors" />
                                                                </div>
                                                                <span>Mi Panel</span>
                                                            </Link>
                                                        )}

                                                        <div className="h-px bg-gray-50 my-1 mx-2"></div>

                                                        <button
                                                            onClick={logoutHandler}
                                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[11.5px] text-red-500 hover:text-red-600 hover:bg-red-50 transition-all group/logout cursor-pointer"
                                                        >
                                                            <div className="w-6 h-6 rounded-lg bg-red-50 flex items-center justify-center group-hover/logout:bg-red-500 transition-colors pointer-events-none">
                                                                <LogOut className="h-3.5 w-3.5 text-red-500 group-hover/logout:text-white transition-colors" />
                                                            </div>
                                                            <span className="pointer-events-none">Cerrar Sesión</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setIsAuthModalOpen(true)}
                                                className="flex items-center gap-2 text-white/80 hover:text-white transition-colors p-1 cursor-pointer"
                                            >
                                                <span className="hidden md:inline text-[10px] xl:text-[11px] font-normal lowercase">
                                                    ingresar
                                                </span>
                                                <div className="bg-white/10 p-1.5 rounded-full border border-white/10 hover:bg-white/20 transition-all">
                                                    <User className="h-4 w-4 text-white" />
                                                </div>
                                            </button>
                                        )}
                                    </>
                                ) : (
                                    /* Placeholder for hydration match */
                                    <div className="p-1.5 opacity-0">
                                        <div className="h-7 w-7 rounded-full bg-white/10" />
                                    </div>
                                )}
                            </div>

                            {/* Cart Section - Client Side Sensitive */}
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    openDrawer();
                                }}
                                className="flex items-center gap-2 group px-1"
                            >
                                <span className="hidden md:inline text-[11px] font-medium text-white">
                                    {mounted ? `$ ${totalPrice.toLocaleString('es-AR')}` : "$ 0"}
                                </span>
                                <div className="relative">
                                    <ShoppingBag className="h-5.5 w-5.5 text-white transition-transform group-hover:scale-110" />
                                    {mounted && itemCount > 0 && (
                                        <span className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[9px] font-black h-4 w-4 rounded-full flex items-center justify-center shadow-lg border border-white/10">
                                            {itemCount}
                                        </span>
                                    )}
                                </div>
                            </button>

                        </div>
                    </nav>
                </div>
            </header>

            {/* Mobile Menu Backdrop */}
            {isMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-[100] transition-opacity duration-300 lg:hidden"
                    onClick={() => setIsMenuOpen(false)}
                />
            )}
        </>
    );
};
