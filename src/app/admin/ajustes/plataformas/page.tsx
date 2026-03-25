"use client";

import { useState, useEffect } from "react";

import { useAuthStore } from "@/store/useAuthStore";
import { 
    Instagram, 
    Facebook, 
    Twitter, 
    Youtube, 
    Plus, 
    Save, 
    Loader2, 
    CheckCircle2, 
    XCircle 
} from "lucide-react";
import { TikTokIcon } from "@/components/icons/TikTokIcon";

export default function PlataformasPage() {
    const { user } = useAuthStore();
    const [isSaving, setIsSaving] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    const [settings, setSettings] = useState({
        instagramUrl: "",
        facebookUrl: "",
        xUrl: "",
        youtubeUrl: "",
        tiktokUrl: "",
        whatsappNumber: ""
    });

    const showToast = (message: string, type: "success" | "error" = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    };

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch("/api/settings");
                const data = await res.json();
                if (data && !data.error) {
                    setSettings({
                        instagramUrl: data.instagramUrl || "",
                        facebookUrl: data.facebookUrl || "",
                        xUrl: data.xUrl || "",
                        youtubeUrl: data.youtubeUrl || "",
                        tiktokUrl: data.tiktokUrl || "",
                        whatsappNumber: data.whatsappNumber || ""
                    });
                }
            } catch (error) {
                console.error("Error fetching settings:", error);
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const res = await fetch("/api/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings)
            });
            if (res.ok) {
                showToast("Configuraciones guardadas ✨", "success");
                window.dispatchEvent(new Event("settings-updated"));
            } else {
                showToast("Error al guardar configuraciones", "error");
            }
        } catch (error) {
            showToast("Error de conexión", "error");
        } finally {
            setIsSaving(false);
        }
    };

    return (
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
                <div className="bg-[#0a0a0a] border border-white/5 rounded-[32px] p-10 md:p-12 shadow-2xl">
                    <div className="space-y-2 mb-10">
                        <h1 className="text-white text-3xl font-bold tracking-tight">Redes Sociales y WhatsApp</h1>
                        <p className="text-white/40 text-sm tracking-wide">Configurá los enlaces que aparecerán en el Header y Footer del sitio.</p>
                    </div>

                    <form onSubmit={handleSave} className="space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                            {/* Instagram */}
                            <div className="space-y-3">
                                <label className="text-white/80 text-sm font-medium flex items-center gap-2.5">
                                    <Instagram className="h-4 w-4 text-white/60" /> Instagram
                                </label>
                                <input
                                    type="text"
                                    placeholder="https://instagram.com/tu-usuario"
                                    value={settings.instagramUrl}
                                    onChange={(e) => setSettings({ ...settings, instagramUrl: e.target.value })}
                                    className="w-full bg-[#141414] border border-white/10 rounded-2xl px-5 py-4 text-white text-[15px] focus:outline-none focus:border-white/20 focus:bg-[#1a1a1a] transition-all placeholder:text-white/10"
                                />
                            </div>

                            {/* Facebook */}
                            <div className="space-y-3">
                                <label className="text-white/80 text-sm font-medium flex items-center gap-2.5">
                                    <Facebook className="h-4 w-4 text-white/60" /> Facebook
                                </label>
                                <input
                                    type="text"
                                    placeholder="https://facebook.com/tu-pagina"
                                    value={settings.facebookUrl}
                                    onChange={(e) => setSettings({ ...settings, facebookUrl: e.target.value })}
                                    className="w-full bg-[#141414] border border-white/10 rounded-2xl px-5 py-4 text-white text-[15px] focus:outline-none focus:border-white/20 focus:bg-[#1a1a1a] transition-all placeholder:text-white/10"
                                />
                            </div>

                            {/* X */}
                            <div className="space-y-3">
                                <label className="text-white/80 text-sm font-medium flex items-center gap-2.5">
                                    <Twitter className="h-4 w-4 text-white/60" /> X (Ex Twitter)
                                </label>
                                <input
                                    type="text"
                                    placeholder="https://x.com/tu-usuario"
                                    value={settings.xUrl}
                                    onChange={(e) => setSettings({ ...settings, xUrl: e.target.value })}
                                    className="w-full bg-[#141414] border border-white/10 rounded-2xl px-5 py-4 text-white text-[15px] focus:outline-none focus:border-white/20 focus:bg-[#1a1a1a] transition-all placeholder:text-white/10"
                                />
                            </div>

                            {/* YouTube */}
                            <div className="space-y-3">
                                <label className="text-white/80 text-sm font-medium flex items-center gap-2.5">
                                    <Youtube className="h-4 w-4 text-white/60" /> YouTube
                                </label>
                                <input
                                    type="text"
                                    placeholder="https://youtube.com/@tu-canal"
                                    value={settings.youtubeUrl}
                                    onChange={(e) => setSettings({ ...settings, youtubeUrl: e.target.value })}
                                    className="w-full bg-[#141414] border border-white/10 rounded-2xl px-5 py-4 text-white text-[15px] focus:outline-none focus:border-white/20 focus:bg-[#1a1a1a] transition-all placeholder:text-white/10"
                                />
                            </div>

                            {/* TikTok */}
                            <div className="space-y-3">
                                <label className="text-white/80 text-sm font-medium flex items-center gap-2.5">
                                    <TikTokIcon className="h-4 w-4 text-white/60" /> TikTok
                                </label>
                                <input
                                    type="text"
                                    placeholder="https://tiktok.com/@tu-usuario"
                                    value={settings.tiktokUrl}
                                    onChange={(e) => setSettings({ ...settings, tiktokUrl: e.target.value })}
                                    className="w-full bg-[#141414] border border-white/10 rounded-2xl px-5 py-4 text-white text-[15px] focus:outline-none focus:border-white/20 focus:bg-[#1a1a1a] transition-all placeholder:text-white/10"
                                />
                            </div>

                            {/* WhatsApp */}
                            <div className="space-y-3">
                                <label className="text-white/80 text-sm font-medium flex items-center gap-2.5">
                                    <Plus className="h-4 w-4 text-white/60" /> WhatsApp (Número completo)
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ej: 5493411234567"
                                    value={settings.whatsappNumber}
                                    onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                                    className="w-full bg-[#141414] border border-white/10 rounded-2xl px-5 py-4 text-white text-[15px] focus:outline-none focus:border-white/20 focus:bg-[#1a1a1a] transition-all placeholder:text-white/10"
                                />
                                <p className="text-[11px] text-white/20 italic mt-2 ml-1">Sin espacios, sin el +, incluyendo código de país y área.</p>
                            </div>
                        </div>

                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="w-full bg-[#1e462f] hover:bg-[#25573a] text-white py-5 rounded-[20px] text-[16px] font-bold tracking-tight transition-all flex items-center justify-center gap-3 shadow-xl active:scale-[0.98] disabled:opacity-50"
                            >
                                {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                                Guardar Configuraciones
                            </button>
                        </div>
                    </form>
                </div>

                {/* TOAST */}
                {toast && (
                    <div className={`fixed bottom-8 right-8 px-6 py-4 rounded-2xl shadow-2xl border animate-in slide-in-from-right-8 duration-500 z-50 ${
                        toast.type === 'success' ? 'bg-[#0c120e] border-primary/20 text-primary' : 'bg-red-500/10 border-red-500/20 text-red-500'
                    }`}>
                        <div className="flex items-center gap-3">
                            {toast.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                            <p className="text-sm font-medium">{toast.message}</p>
                        </div>
                    </div>
                )}
            </div>
    );
}
