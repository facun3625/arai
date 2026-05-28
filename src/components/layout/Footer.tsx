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
                        {settings?.footerDescription || "Llevamos lo mejor de nuestra tierra a tu mesa. Yerba mate de autor con alma misionera."}
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
                            {settings?.footerEmail || "info@arayerba.com"}
                        </li>
                        <li className="flex flex-col gap-1">
                            <span className="text-[10px] uppercase text-white/30">WhatsApp</span>
                            {socialLinks.whatsappNumber ? (
                                <a
                                    href={`https://wa.me/${socialLinks.whatsappNumber}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-[#25D366] transition-colors"
                                >
                                    +{socialLinks.whatsappNumber}
                                </a>
                            ) : "+54 9 11 1234 5678"}
                        </li>
                        <li className="flex flex-col gap-1">
                            <span className="text-[10px] uppercase text-white/30">Ubicación</span>
                            {settings?.footerLocation || "Misiones, Argentina"}
                        </li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-[11px] font-bold text-white mb-8 uppercase opacity-40">seguinos</h4>
                    <div className="flex gap-4">
                        {socialLinks.whatsappNumber && (
                            <a href={`https://wa.me/${socialLinks.whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center hover:bg-[#25D366] hover:border-[#25D366] transition-all duration-500 group">
                                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                </svg>
                            </a>
                        )}
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
                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.261 5.635 5.903-5.635zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                </svg>
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
