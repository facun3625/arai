"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { Loader2, Hammer, Instagram, Facebook, Lock } from "lucide-react";
import Image from "next/image";
import { TikTokIcon } from "@/components/icons/TikTokIcon";
import { AuthModal } from "@/components/auth/AuthModal";

export function MaintenanceGuard({ children }: { children: React.ReactNode }) {
    const [isMaintenance, setIsMaintenance] = useState<boolean | null>(null);
    const { user } = useAuthStore();
    const [socials, setSocials] = useState<any>(null);
    const [showLoginModal, setShowLoginModal] = useState(false);

    useEffect(() => {
        const checkMaintenance = async () => {
            try {
                const res = await fetch("/api/settings");
                const data = await res.json();
                setIsMaintenance(data.maintenanceMode || false);
                setSocials({
                    instagram: data.instagramUrl,
                    facebook: data.facebookUrl,
                    tiktok: data.tiktokUrl,
                    whatsapp: data.whatsappNumber
                });
            } catch (error) {
                console.error("Failed to check maintenance mode:", error);
                setIsMaintenance(false);
            }
        };

        checkMaintenance();
        
        // Listen for internal updates
        const handleUpdate = () => checkMaintenance();
        window.addEventListener("settings-updated", handleUpdate);
        return () => window.removeEventListener("settings-updated", handleUpdate);
    }, []);

    // Bypass for Admins or Testers
    const isAuthorized = user?.role === 'ADMIN' || user?.role === 'TEST';

    if (isMaintenance === null) return children;

    if (isMaintenance && !isAuthorized) {
        return (
            <div className="fixed inset-0 z-[9999] bg-[#0c120e] flex flex-col items-center justify-center p-6 overflow-hidden text-white">
                {/* Background Decorations */}
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />

                <div className="relative z-10 max-w-2xl w-full flex flex-col items-center text-center space-y-12">
                    {/* Logo */}
                    <div className="animate-in fade-in slide-in-from-top-4 duration-1000">
                        <Image 
                            src="/arai_logo.png" 
                            alt="Araí Yerba Mate" 
                            width={180} 
                            height={60} 
                            className="h-16 w-auto brightness-110"
                            priority
                        />
                    </div>

                    {/* Content Card */}
                    <div className="bg-white/[0.03] border border-white/10 backdrop-blur-xl rounded-[40px] p-8 md:p-12 shadow-2xl animate-in zoom-in fade-in duration-700">
                        <div className="flex flex-col items-center space-y-6">
                            <div className="h-20 w-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center animate-bounce duration-[2000ms]">
                                <Hammer className="h-10 w-10 text-primary" />
                            </div>
                            
                            <div className="space-y-3">
                                <h1 className="text-3xl md:text-4xl font-light text-white font-montserrat tracking-tight">
                                    Estamos renovando <br /> 
                                    <span className="font-bold text-primary italic">tu experiencia Araí</span>
                                </h1>
                                <p className="text-white/40 text-[14px] md:text-[16px] leading-relaxed max-w-md mx-auto">
                                    Estamos realizando mejoras técnicas en nuestra tienda online para ofrecerte lo mejor. Volveremos muy pronto.
                                </p>
                            </div>

                            <div className="w-16 h-1 bg-primary/20 rounded-full" />
                            
                            <div className="space-y-4 w-full">
                                <p className="text-[10px] uppercase tracking-[0.3em] text-white/30 font-bold">Seguinos para novedades</p>
                                <div className="flex items-center justify-center gap-6">
                                    {socials?.instagram && (
                                        <a href={socials.instagram} target="_blank" rel="noreferrer" className="p-3 bg-white/5 border border-white/10 rounded-2xl text-white/60 hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all">
                                            <Instagram className="h-6 w-6" />
                                        </a>
                                    )}
                                    {socials?.facebook && (
                                        <a href={socials.facebook} target="_blank" rel="noreferrer" className="p-3 bg-white/5 border border-white/10 rounded-2xl text-white/60 hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all">
                                            <Facebook className="h-6 w-6" />
                                        </a>
                                    )}
                                    {socials?.tiktok && (
                                        <a href={socials.tiktok} target="_blank" rel="noreferrer" className="p-3 bg-white/5 border border-white/10 rounded-2xl text-white/60 hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all">
                                            <TikTokIcon className="h-6 w-6" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer & Staff Access */}
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500 space-y-6">
                        <p className="text-white/20 text-[11px] uppercase tracking-widest font-medium">
                            Araí Yerba Mate · Calidad Premium
                        </p>
                        
                        <button 
                            onClick={() => setShowLoginModal(true)}
                            className="flex items-center gap-2 mx-auto text-[10px] uppercase tracking-[0.2em] text-white/10 hover:text-primary transition-all duration-300"
                        >
                            <Lock className="h-3 w-3" />
                            Acceso Staff
                        </button>
                    </div>
                </div>

                <AuthModal 
                    isOpen={showLoginModal} 
                    onClose={() => setShowLoginModal(false)} 
                />
            </div>
        );
    }

    return children;
}
