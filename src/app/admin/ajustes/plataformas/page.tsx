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
        whatsappNumber: "",
        franquiciasUrl: "",
        mayoristasUrl: "",
        footerDescription: "",
        footerEmail: "",
        footerLocation: "",
        legalBusinessName: "",
        legalCuit: "",
        legalAddress: "",
        showReturnsNotice: true
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
                        whatsappNumber: data.whatsappNumber || "",
                        franquiciasUrl: data.franquiciasUrl || "",
                        mayoristasUrl: data.mayoristasUrl || "",
                        footerDescription: data.footerDescription || "",
                        footerEmail: data.footerEmail || "",
                        footerLocation: data.footerLocation || "",
                        legalBusinessName: data.legalBusinessName || "",
                        legalCuit: data.legalCuit || "",
                        legalAddress: data.legalAddress || "",
                        showReturnsNotice: data.showReturnsNotice !== false
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
                showToast("Los cambios ya están publicados en el sitio.", "success");
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
            <div className="w-full space-y-8 animate-in fade-in duration-700">
                <div className="bg-white border border-slate-200 rounded-[32px] p-10 md:p-12 shadow-2xl">
                    <div className="space-y-2 mb-10">
                        <h1 className="text-slate-900 text-3xl font-bold tracking-tight">Redes Sociales y WhatsApp</h1>
                        <p className="text-slate-600 text-sm tracking-wide">Configurá los enlaces que aparecerán en el Header y Footer del sitio.</p>
                    </div>

                    <form onSubmit={handleSave} className="space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                            {/* Instagram */}
                            <div className="space-y-3">
                                <label className="text-slate-900 text-sm font-medium flex items-center gap-2.5">
                                    <Instagram className="h-4 w-4 text-slate-600" /> Instagram
                                </label>
                                <input
                                    type="text"
                                    placeholder="https://instagram.com/tu-usuario"
                                    value={settings.instagramUrl}
                                    onChange={(e) => setSettings({ ...settings, instagramUrl: e.target.value })}
                                    className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 text-[15px] focus:outline-none focus:border-slate-200 focus:bg-white transition-all placeholder:text-slate-500"
                                />
                            </div>

                            {/* Facebook */}
                            <div className="space-y-3">
                                <label className="text-slate-900 text-sm font-medium flex items-center gap-2.5">
                                    <Facebook className="h-4 w-4 text-slate-600" /> Facebook
                                </label>
                                <input
                                    type="text"
                                    placeholder="https://facebook.com/tu-pagina"
                                    value={settings.facebookUrl}
                                    onChange={(e) => setSettings({ ...settings, facebookUrl: e.target.value })}
                                    className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 text-[15px] focus:outline-none focus:border-slate-200 focus:bg-white transition-all placeholder:text-slate-500"
                                />
                            </div>

                            {/* X */}
                            <div className="space-y-3">
                                <label className="text-slate-900 text-sm font-medium flex items-center gap-2.5">
                                    <Twitter className="h-4 w-4 text-slate-600" /> X (Ex Twitter)
                                </label>
                                <input
                                    type="text"
                                    placeholder="https://x.com/tu-usuario"
                                    value={settings.xUrl}
                                    onChange={(e) => setSettings({ ...settings, xUrl: e.target.value })}
                                    className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 text-[15px] focus:outline-none focus:border-slate-200 focus:bg-white transition-all placeholder:text-slate-500"
                                />
                            </div>

                            {/* YouTube */}
                            <div className="space-y-3">
                                <label className="text-slate-900 text-sm font-medium flex items-center gap-2.5">
                                    <Youtube className="h-4 w-4 text-slate-600" /> YouTube
                                </label>
                                <input
                                    type="text"
                                    placeholder="https://youtube.com/@tu-canal"
                                    value={settings.youtubeUrl}
                                    onChange={(e) => setSettings({ ...settings, youtubeUrl: e.target.value })}
                                    className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 text-[15px] focus:outline-none focus:border-slate-200 focus:bg-white transition-all placeholder:text-slate-500"
                                />
                            </div>

                            {/* TikTok */}
                            <div className="space-y-3">
                                <label className="text-slate-900 text-sm font-medium flex items-center gap-2.5">
                                    <TikTokIcon className="h-4 w-4 text-slate-600" /> TikTok
                                </label>
                                <input
                                    type="text"
                                    placeholder="https://tiktok.com/@tu-usuario"
                                    value={settings.tiktokUrl}
                                    onChange={(e) => setSettings({ ...settings, tiktokUrl: e.target.value })}
                                    className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 text-[15px] focus:outline-none focus:border-slate-200 focus:bg-white transition-all placeholder:text-slate-500"
                                />
                            </div>

                            {/* WhatsApp */}
                            <div className="space-y-3">
                                <label className="text-slate-900 text-sm font-medium flex items-center gap-2.5">
                                    <Plus className="h-4 w-4 text-slate-600" /> WhatsApp (Número completo)
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ej: 5493411234567"
                                    value={settings.whatsappNumber}
                                    onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                                    className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 text-[15px] focus:outline-none focus:border-slate-200 focus:bg-white transition-all placeholder:text-slate-500"
                                />
                                <p className="text-[11px] text-slate-500 italic mt-2 ml-1">Sin espacios, sin el +, incluyendo código de país y área.</p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="border-t border-slate-200 pt-8 space-y-2">
                            <h3 className="text-slate-900 text-sm font-semibold mb-6">Contenido del Footer</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                                <div className="space-y-3 md:col-span-2">
                                    <label className="text-slate-900 text-sm font-medium">Descripción (texto bajo el logo)</label>
                                    <textarea
                                        rows={2}
                                        placeholder="Llevamos lo mejor de nuestra tierra a tu mesa..."
                                        value={settings.footerDescription}
                                        onChange={(e) => setSettings({ ...settings, footerDescription: e.target.value })}
                                        className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 text-[15px] focus:outline-none focus:border-slate-200 focus:bg-white transition-all placeholder:text-slate-500 resize-none"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-slate-900 text-sm font-medium">Email de contacto</label>
                                    <input
                                        type="text"
                                        placeholder="info@arayerba.com"
                                        value={settings.footerEmail}
                                        onChange={(e) => setSettings({ ...settings, footerEmail: e.target.value })}
                                        className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 text-[15px] focus:outline-none focus:border-slate-200 focus:bg-white transition-all placeholder:text-slate-500"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-slate-900 text-sm font-medium">Ubicación</label>
                                    <input
                                        type="text"
                                        placeholder="Misiones, Argentina"
                                        value={settings.footerLocation}
                                        onChange={(e) => setSettings({ ...settings, footerLocation: e.target.value })}
                                        className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 text-[15px] focus:outline-none focus:border-slate-200 focus:bg-white transition-all placeholder:text-slate-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Datos Legales */}
                        <div className="border-t border-slate-200 pt-8 space-y-2">
                            <h3 className="text-slate-900 text-sm font-semibold mb-2">Datos Legales de la Empresa</h3>
                            <p className="text-[11px] text-slate-500 mb-6">
                                Se usan en las páginas de Términos, Privacidad, Cambios/Devoluciones y en el Botón de Arrepentimiento.
                                Hasta que los completes, esas páginas muestran &quot;[Completar desde el panel]&quot; en su lugar.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                                <div className="space-y-3">
                                    <label className="text-slate-900 text-sm font-medium">Razón social</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Araí S.R.L."
                                        value={settings.legalBusinessName}
                                        onChange={(e) => setSettings({ ...settings, legalBusinessName: e.target.value })}
                                        className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 text-[15px] focus:outline-none focus:border-slate-200 focus:bg-white transition-all placeholder:text-slate-500"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-slate-900 text-sm font-medium">CUIT</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: 30-12345678-9"
                                        value={settings.legalCuit}
                                        onChange={(e) => setSettings({ ...settings, legalCuit: e.target.value })}
                                        className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 text-[15px] focus:outline-none focus:border-slate-200 focus:bg-white transition-all placeholder:text-slate-500"
                                    />
                                </div>
                                <div className="space-y-3 md:col-span-2">
                                    <label className="text-slate-900 text-sm font-medium">Domicilio legal</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Av. Siempre Viva 123, Posadas, Misiones"
                                        value={settings.legalAddress}
                                        onChange={(e) => setSettings({ ...settings, legalAddress: e.target.value })}
                                        className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 text-[15px] focus:outline-none focus:border-slate-200 focus:bg-white transition-all placeholder:text-slate-500"
                                    />
                                </div>
                                <div className="md:col-span-2 flex items-center justify-between bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4">
                                    <div>
                                        <p className="text-slate-900 text-sm font-medium">Aviso de arrepentimiento en la ficha de producto</p>
                                        <p className="text-[11px] text-slate-500 mt-0.5">
                                            Muestra &quot;10 días para arrepentirte de tu compra&quot; junto al botón de comprar.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setSettings({ ...settings, showReturnsNotice: !settings.showReturnsNotice })}
                                        className={`relative w-12 h-7 rounded-full transition-colors shrink-0 ${settings.showReturnsNotice ? "bg-primary" : "bg-slate-300"}`}
                                    >
                                        <span className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${settings.showReturnsNotice ? "translate-x-5" : "translate-x-0"}`} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Franquicias & Mayoristas */}
                        <div className="border-t border-slate-200 pt-8 space-y-2">
                            <h3 className="text-slate-900 text-sm font-semibold mb-6">Botones del Home</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                                <div className="space-y-3">
                                    <label className="text-slate-900 text-sm font-medium">Franquicias — URL del botón</label>
                                    <input
                                        type="text"
                                        placeholder="https://..."
                                        value={settings.franquiciasUrl}
                                        onChange={(e) => setSettings({ ...settings, franquiciasUrl: e.target.value })}
                                        className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 text-[15px] focus:outline-none focus:border-slate-200 focus:bg-white transition-all placeholder:text-slate-500"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-slate-900 text-sm font-medium">Mayoristas — URL del botón</label>
                                    <input
                                        type="text"
                                        placeholder="https://..."
                                        value={settings.mayoristasUrl}
                                        onChange={(e) => setSettings({ ...settings, mayoristasUrl: e.target.value })}
                                        className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 text-[15px] focus:outline-none focus:border-slate-200 focus:bg-white transition-all placeholder:text-slate-500"
                                    />
                                </div>
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
                    <div className={`fixed bottom-8 right-8 z-50 animate-in slide-in-from-bottom-4 duration-500 ${
                        toast.type === 'success'
                            ? 'text-slate-900'
                            : 'text-slate-900'
                    }`}>
                        <div className={`flex items-start gap-4 px-6 py-5 rounded-2xl shadow-[0_20px_60px_-10px_rgba(0,0,0,0.6)] border min-w-[280px] ${
                            toast.type === 'success'
                                ? 'bg-green-50 border-primary/30'
                                : 'bg-red-50 border-red-500/30'
                        }`}>
                            <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                toast.type === 'success' ? 'bg-primary/20' : 'bg-red-500/20'
                            }`}>
                                {toast.type === 'success'
                                    ? <CheckCircle2 className="h-4 w-4 text-primary" />
                                    : <XCircle className="h-4 w-4 text-red-700" />
                                }
                            </div>
                            <div>
                                <p className={`text-[13px] font-semibold ${toast.type === 'success' ? 'text-slate-900' : 'text-red-700'}`}>
                                    {toast.type === 'success' ? '¡Guardado!' : 'Error'}
                                </p>
                                <p className="text-[12px] text-slate-600 mt-0.5">{toast.message}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
    );
}
