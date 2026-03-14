"use client";

import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import { TikTokIcon } from "@/components/icons/TikTokIcon";
import { useEffect, useState } from "react";

export const Footer = () => {
    const [settings, setSettings] = useState<any>(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch("/api/settings");
                if (res.ok) {
                    const data = await res.json();
                    setSettings(data);
                }
            } catch (error) {
                console.error("Failed to fetch settings for footer", error);
            }
        };
        fetchSettings();

        const handleSettingsUpdated = () => fetchSettings();
        window.addEventListener("settings-updated", handleSettingsUpdated);
        return () => window.removeEventListener("settings-updated", handleSettingsUpdated);
    }, []);

    const socialLinks = settings || {
        instagramUrl: "",
        facebookUrl: "",
        xUrl: "",
        youtubeUrl: "",
        tiktokUrl: "",
        whatsappNumber: ""
    };
    return (
        <footer className="bg-primary text-white py-20 px-4 relative overflow-hidden">
            {/* Sutil textura o gradiente de fondo */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/5 to-transparent pointer-events-none" />

            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
                <div className="space-y-6">
                    <a href="/" className="inline-block group relative w-28 h-10">
                        <img
                            src="/arai_logo.png"
                            alt="Araí Yerba Mate"
                            className="h-full w-auto brightness-0 invert transition-transform duration-500 group-hover:scale-105 object-contain"
                        />
                    </a>
                    <p className="text-[13px] text-white/60 leading-relaxed font-medium max-w-[200px]">
                        Llevamos lo mejor de nuestra tierra a tu mesa. Yerba mate de autor con alma misionera.
                    </p>
                </div>
                <div>
                    <h4 className="text-[11px] font-bold text-white mb-8 uppercase opacity-40">secciones</h4>
                    <ul className="text-xs space-y-4 text-white/70 font-medium">
                        <li><a href="/" className="hover:text-white transition-colors flex items-center gap-2 group"><span className="w-0 group-hover:w-2 h-px bg-white transition-all"></span>Inicio</a></li>
                        <li><a href="/tienda" className="hover:text-white transition-colors flex items-center gap-2 group"><span className="w-0 group-hover:w-2 h-px bg-white transition-all"></span>Tienda</a></li>
                        <li><a href="/proceso-productivo" className="hover:text-white transition-colors flex items-center gap-2 group"><span className="w-0 group-hover:w-2 h-px bg-white transition-all"></span>Proceso Productivo</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-[11px] font-bold text-white mb-8 uppercase opacity-40">contacto</h4>
                    <ul className="text-xs space-y-4 text-white/70 font-medium">
                        <li className="flex flex-col gap-1">
                            <span className="text-[10px] uppercase text-white/30">Email</span>
                            info@arayerba.com
                        </li>
                        <li className="flex flex-col gap-1">
                            <span className="text-[10px] uppercase text-white/30">Teléfono / WhatsApp</span>
                            {socialLinks.whatsappNumber ? `+${socialLinks.whatsappNumber}` : "+54 9 11 1234 5678"}
                        </li>
                        <li className="flex flex-col gap-1">
                            <span className="text-[10px] uppercase text-white/30">Ubicación</span>
                            Misiones, Argentina
                        </li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-[11px] font-bold text-white mb-8 uppercase opacity-40">seguinos</h4>
                    <div className="flex gap-4">
                        {socialLinks.instagramUrl && (
                            <a href={socialLinks.instagramUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center hover:bg-white hover:text-primary transition-all duration-500 group">
                                <Instagram className="h-5 w-5" />
                            </a>
                        )}
                        {socialLinks.facebookUrl && (
                            <a href={socialLinks.facebookUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center hover:bg-white hover:text-primary transition-all duration-500 group">
                                <Facebook className="h-5 w-5" />
                            </a>
                        )}
                        {socialLinks.xUrl && (
                            <a href={socialLinks.xUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center hover:bg-white hover:text-primary transition-all duration-500 group">
                                <Twitter className="h-5 w-5" />
                            </a>
                        )}
                        {socialLinks.youtubeUrl && (
                            <a href={socialLinks.youtubeUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center hover:bg-white hover:text-primary transition-all duration-500 group">
                                <Youtube className="h-5 w-5" />
                            </a>
                        )}
                        {socialLinks.tiktokUrl && (
                            <a href={socialLinks.tiktokUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center hover:bg-white hover:text-primary transition-all duration-500 group">
                                <TikTokIcon className="h-5 w-5" />
                            </a>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto border-t border-white/10 mt-20 pt-10 flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
                <p className="text-[11px] text-white/30 font-medium lowercase">
                    © {new Date().getFullYear()} araí yerba mate. todos los derechos reservados.
                </p>
                <a
                    href="https://kubbo.com.ar"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 opacity-40 hover:opacity-100 transition-all duration-500 group"
                >
                    <img
                        src="/images/proceso/logo_verde.png"
                        alt="Kubbo"
                        className="h-5 w-auto brightness-0 invert transition-transform group-hover:scale-110"
                    />
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/60 group-hover:text-white whitespace-nowrap">desarrollos de web apps</span>
                </a>
            </div>
        </footer>
    );
};
