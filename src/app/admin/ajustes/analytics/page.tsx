"use client";

import { useState, useEffect } from "react";
import { Save, Loader2, CheckCircle2, XCircle, BarChart2, Facebook } from "lucide-react";

export default function AnalyticsPage() {
    const [isSaving, setIsSaving] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
    const [settings, setSettings] = useState({
        metaPixelId: "",
        ga4MeasurementId: "",
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
                        metaPixelId: data.metaPixelId || "",
                        ga4MeasurementId: data.ga4MeasurementId || "",
                    });
                }
            } catch {
                console.error("Error fetching settings");
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
                body: JSON.stringify(settings),
            });
            if (res.ok) {
                showToast("Configuración guardada ✨", "success");
            } else {
                showToast("Error al guardar", "error");
            }
        } catch {
            showToast("Error de conexión", "error");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
            <div className="bg-[#0a0a0a] border border-white/5 rounded-[32px] p-10 md:p-12 shadow-2xl">
                <div className="space-y-2 mb-10">
                    <h1 className="text-white text-3xl font-bold tracking-tight">Analytics & Tracking</h1>
                    <p className="text-white/40 text-sm tracking-wide">
                        Pegá tus IDs y los scripts se activan automáticamente en toda la tienda.
                    </p>
                </div>

                <form onSubmit={handleSave} className="space-y-10">
                    {/* Meta Pixel */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#1877F2]/10 flex items-center justify-center">
                                <Facebook className="h-4 w-4 text-[#1877F2]" />
                            </div>
                            <div>
                                <p className="text-white text-sm font-semibold">Meta Pixel</p>
                                <p className="text-white/30 text-xs">Facebook & Instagram Ads · Remarketing y conversiones</p>
                            </div>
                        </div>
                        <input
                            type="text"
                            placeholder="Ej: 1234567890123456"
                            value={settings.metaPixelId}
                            onChange={(e) => setSettings({ ...settings, metaPixelId: e.target.value })}
                            className="w-full bg-[#141414] border border-white/10 rounded-2xl px-5 py-4 text-white text-[15px] focus:outline-none focus:border-white/20 focus:bg-[#1a1a1a] transition-all placeholder:text-white/10 font-mono"
                        />
                        <p className="text-[11px] text-white/20 italic ml-1">
                            Encontralo en Meta Business Suite → Administrador de eventos → Tu Pixel → ID del Pixel
                        </p>
                    </div>

                    <div className="border-t border-white/5" />

                    {/* Google Analytics 4 */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#E37400]/10 flex items-center justify-center">
                                <BarChart2 className="h-4 w-4 text-[#E37400]" />
                            </div>
                            <div>
                                <p className="text-white text-sm font-semibold">Google Analytics 4</p>
                                <p className="text-white/30 text-xs">Tráfico, sesiones y comportamiento de usuarios · Gratis</p>
                            </div>
                        </div>
                        <input
                            type="text"
                            placeholder="Ej: G-XXXXXXXXXX"
                            value={settings.ga4MeasurementId}
                            onChange={(e) => setSettings({ ...settings, ga4MeasurementId: e.target.value })}
                            className="w-full bg-[#141414] border border-white/10 rounded-2xl px-5 py-4 text-white text-[15px] focus:outline-none focus:border-white/20 focus:bg-[#1a1a1a] transition-all placeholder:text-white/10 font-mono"
                        />
                        <p className="text-[11px] text-white/20 italic ml-1">
                            Encontralo en analytics.google.com → Administrar → Flujos de datos → tu flujo → ID de medición
                        </p>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="w-full bg-[#1e462f] hover:bg-[#25573a] text-white py-5 rounded-[20px] text-[16px] font-bold tracking-tight transition-all flex items-center justify-center gap-3 shadow-xl active:scale-[0.98] disabled:opacity-50"
                        >
                            {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                            Guardar y activar
                        </button>
                    </div>
                </form>
            </div>

            {toast && (
                <div className={`fixed bottom-8 right-8 px-6 py-4 rounded-2xl shadow-2xl border animate-in slide-in-from-right-8 duration-500 z-50 ${
                    toast.type === "success"
                        ? "bg-[#0c120e] border-primary/20 text-primary"
                        : "bg-red-500/10 border-red-500/20 text-red-500"
                }`}>
                    <div className="flex items-center gap-3">
                        {toast.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                        <p className="text-sm font-medium">{toast.message}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
