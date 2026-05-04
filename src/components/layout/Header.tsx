"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, User, Facebook, Instagram, Twitter, Menu, ChevronDown, LogOut, LayoutDashboard, X, Youtube } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TikTokIcon } from "@/components/icons/TikTokIcon";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { AuthModal } from "@/components/auth/AuthModal";

export const Header = () => {
    const [mounted, setMounted] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [bankDiscount, setBankDiscount] = useState<number | null>(null);
    const [currentLang, setCurrentLang] = useState<'es' | 'en'>('es');

    const switchLanguage = (lang: 'es' | 'en') => {
        const select = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
        if (select) {
            select.value = lang === 'en' ? 'en' : 'es';
            select.dispatchEvent(new Event('change'));
            setCurrentLang(lang);
        }
    };
    const [socialLinks, setSocialLinks] = useState({
        instagramUrl: "",
        facebookUrl: "",
        xUrl: "",
        youtubeUrl: "",
        tiktokUrl: "",
        whatsappNumber: "",
        franquiciasUrl: "",
        mayoristasUrl: ""
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
                        whatsappNumber: data.whatsappNumber || "",
                        franquiciasUrl: data.franquiciasUrl || "",
                        mayoristasUrl: data.mayoristasUrl || ""
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

    // Block scroll when menu is open
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
    }, [isMenuOpen]);

    return (
        <>
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
            />
            {/* 1. Black Top Bar */}
            <div className="bg-[#1a1a1a] text-white py-2 font-montserrat relative z-[60] overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 lg:px-8 flex items-center justify-between">
                    <div className="flex gap-2">
                        {socialLinks.franquiciasUrl && (
                            <a href={socialLinks.franquiciasUrl} target="_blank" rel="noopener noreferrer" className="bg-[#23553D]/40 hover:bg-[#23553D] text-[9px] font-bold px-4 py-1.5 rounded-full border border-white/10 transition-all uppercase">
                                Franquicias
                            </a>
                        )}
                        {socialLinks.mayoristasUrl && (
                            <a href={socialLinks.mayoristasUrl} target="_blank" rel="noopener noreferrer" className="bg-[#23553D]/40 hover:bg-[#23553D] text-[9px] font-bold px-4 py-1.5 rounded-full border border-white/10 transition-all uppercase">
                                Mayoristas
                            </a>
                        )}
                    </div>

                    <div className="hidden lg:block text-[9px] font-bold text-white/90">
                        {bankDiscount !== null && bankDiscount > 0 ? (
                            <>
                                <span className="text-primary font-black">{bankDiscount}%</span> POR TRANSF. BANCARIA
                            </>
                        ) : ""}
                    </div>

                    <div className="flex items-center gap-4">
                        {socialLinks.whatsappNumber && (
                            <a
                                href={`https://wa.me/${socialLinks.whatsappNumber}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hidden lg:flex items-center gap-1.5 text-[9px] font-bold text-[#25D366] hover:text-[#1fb559] transition-colors uppercase"
                            >
                                <svg viewBox="0 0 24 24" className="h-3 w-3 fill-current" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                </svg>
                                WhatsApp
                            </a>
                        )}
                        <div className="flex items-center gap-2 text-[9px] font-bold text-white/70">
                            <button
                                onClick={() => switchLanguage('en')}
                                className={`flex items-center gap-1 cursor-pointer uppercase text-[9px] transition-colors ${currentLang === 'en' ? 'text-white' : 'hover:text-white'}`}
                            >
                                English
                            </button>
                            <span className="text-white/20">|</span>
                            <button
                                onClick={() => switchLanguage('es')}
                                className={`flex items-center gap-1 cursor-pointer uppercase text-[9px] transition-colors ${currentLang === 'es' ? 'text-white' : 'hover:text-white'}`}
                            >
                                Español
                            </button>
                        </div>
                        <div className="hidden lg:flex items-center gap-2 border-l border-white/10 pl-4">
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
                                    <svg className="h-3.5 w-3.5 text-white/70 hover:text-white cursor-pointer transition-colors fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.261 5.635 5.903-5.635zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                    </svg>
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

                        <div className="hidden lg:flex items-center gap-4 xl:gap-8 overflow-visible">
                            {[
                                { name: 'Inicio', href: '/' },
                                { name: 'Proceso Productivo', href: '/proceso' },
                                { name: 'Videos', href: '/videos' },
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
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-3 md:gap-5">
                            {/* User Section - Client Side Sensitive */}
                            <div className="relative min-w-[32px] md:min-w-[40px] flex justify-end">
                                {mounted ? (
                                    <>
                                        {isAuthenticated && user ? (
                                            <>
                                                <button
                                                    onClick={() => setIsUserMenuOpen(v => !v)}
                                                    className="flex items-center gap-2 cursor-pointer py-1"
                                                >
                                                    <span className="hidden md:inline text-[10px] xl:text-[11px] font-normal text-white/90 lowercase">
                                                        {user.name.split(' ')[0]}
                                                    </span>
                                                    <div className={`bg-white/10 p-1.5 rounded-full border border-white/10 transition-all ${isUserMenuOpen ? 'bg-white/20' : ''}`}>
                                                        <User className="h-4 w-4 text-white" />
                                                    </div>
                                                    <ChevronDown className={`h-3 w-3 text-white/50 transition-all duration-200 ${isUserMenuOpen ? 'rotate-180 text-white' : ''}`} />
                                                </button>

                                                {/* Backdrop */}
                                                {isUserMenuOpen && (
                                                    <div
                                                        className="fixed inset-0 z-[65]"
                                                        onClick={() => setIsUserMenuOpen(false)}
                                                    />
                                                )}

                                                {/* Dropdown Menu */}
                                                <div className={`absolute right-0 top-[calc(100%+8px)] w-52 bg-white border border-gray-100 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-200 origin-top-right z-[70] overflow-hidden ${isUserMenuOpen ? 'opacity-100 visible scale-100' : 'opacity-0 invisible scale-95'}`}>
                                                    <div className="p-3 bg-gray-50/50 border-b border-gray-100 text-left">
                                                        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">mi cuenta</p>
                                                    </div>

                                                    <div className="p-2 text-left">
                                                        {user.role === 'ADMIN' && (
                                                            <Link
                                                                href="/admin/dashboard"
                                                                onClick={() => setIsUserMenuOpen(false)}
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
                                                                onClick={() => setIsUserMenuOpen(false)}
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
                                                            onClick={() => { setIsUserMenuOpen(false); logoutHandler(); }}
                                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[11.5px] text-red-500 hover:text-red-600 hover:bg-red-50 transition-all group/logout cursor-pointer"
                                                        >
                                                            <div className="w-6 h-6 rounded-lg bg-red-50 flex items-center justify-center group-hover/logout:bg-red-500 transition-colors">
                                                                <LogOut className="h-3.5 w-3.5 text-red-500 group-hover/logout:text-white transition-colors" />
                                                            </div>
                                                            <span>Cerrar Sesión</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </>
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

            {/* Mobile Menu Backdrop & Drawer */}
            <AnimatePresence>
                {isMenuOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMenuOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] lg:hidden"
                        />
                        {/* Drawer */}
                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed top-0 left-0 bottom-0 w-[85%] max-w-xs bg-white z-[101] lg:hidden shadow-2xl flex flex-col"
                        >
                            {/* Header Drawer */}
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-primary">
                                <Link href="/" onClick={() => setIsMenuOpen(false)}>
                                    <Image src="/arai_logo.png" alt="Araí" width={80} height={20} className="brightness-0 invert" />
                                </Link>
                                <button
                                    onClick={() => setIsMenuOpen(false)}
                                    className="p-2 bg-white/10 rounded-full text-white"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Nav Links */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                <nav className="space-y-4">
                                    {[
                                        { name: 'Inicio', href: '/' },
                                        { name: 'Proceso Productivo', href: '/proceso' },
                                        { name: 'Videos', href: '/videos' },
                                        { name: 'Tienda', href: '/tienda' },
                                    ].map((item) => (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className="block text-sm font-medium text-gray-900 border-b border-gray-50 pb-4 hover:text-primary transition-colors"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            {item.name}
                                        </Link>
                                    ))}
                                </nav>

                                {/* External Links */}
                                {(socialLinks.franquiciasUrl || socialLinks.mayoristasUrl) && (
                                    <div className="space-y-3 pt-4">
                                        {socialLinks.franquiciasUrl && (
                                            <a
                                                href={socialLinks.franquiciasUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block text-[10px] font-bold uppercase tracking-widest text-primary/60 hover:text-primary"
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                Franquicias
                                            </a>
                                        )}
                                        {socialLinks.mayoristasUrl && (
                                            <a
                                                href={socialLinks.mayoristasUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block text-[10px] font-bold uppercase tracking-widest text-primary/60 hover:text-primary"
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                Mayoristas
                                            </a>
                                        )}
                                    </div>
                                )}

                                {/* Language Selector */}
                                <div className="pt-6 border-t border-gray-100">
                                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-tighter mb-4">Idioma</p>
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => switchLanguage('es')}
                                            className={`text-xs font-medium ${currentLang === 'es' ? 'font-bold text-primary' : 'text-gray-400 hover:text-primary'}`}
                                        >
                                            Español
                                        </button>
                                        <button
                                            onClick={() => switchLanguage('en')}
                                            className={`text-xs font-medium ${currentLang === 'en' ? 'font-bold text-primary' : 'text-gray-400 hover:text-primary'}`}
                                        >
                                            English
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Drawer */}
                            <div className="p-6 border-t border-gray-100 bg-gray-50">
                                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-tighter mb-4">Seguinos</p>
                                <div className="flex gap-5">
                                    {socialLinks.instagramUrl && (
                                        <a href={socialLinks.instagramUrl} target="_blank" rel="noopener noreferrer">
                                            <Instagram className="h-5 w-5 text-gray-400 hover:text-primary transition-colors" />
                                        </a>
                                    )}
                                    {socialLinks.facebookUrl && (
                                        <a href={socialLinks.facebookUrl} target="_blank" rel="noopener noreferrer">
                                            <Facebook className="h-5 w-5 text-gray-400 hover:text-primary transition-colors" />
                                        </a>
                                    )}
                                    {socialLinks.tiktokUrl && (
                                        <a href={socialLinks.tiktokUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors">
                                            <TikTokIcon className="h-5 w-5" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};
