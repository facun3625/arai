"use client";

import { useState, useEffect } from "react";

import { useAuthStore } from "@/store/useAuthStore";
import { 
    Truck, 
    Hash, 
    Settings, 
    MapPin, 
    Save, 
    Loader2, 
    CheckCircle2, 
    XCircle,
    Key,
    Lock,
    Globe
} from "lucide-react";

export default function EnvioPage() {
    const { user } = useAuthStore();
    const [isSaving, setIsSaving] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    const [settings, setSettings] = useState({
        ocaCuit: "",
        ocaOperativa: "",
        ocaOperativaSucursal: "",
        ocaOriginZipCode: "",
        ocaEnabled: true,
        dhlAccountNumber: "",
        dhlApiKey: "",
        dhlSiteId: "",
        dhlEnabled: false
    });
    const [initialSettings, setInitialSettings] = useState<any>(null);
    const [lastSaved, setLastSaved] = useState(false);

    const showToast = (message: string, type: "success" | "error" = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    };

    const fetchSettings = async () => {
        try {
            const res = await fetch("/api/settings");
            const data = await res.json();
            if (data && !data.error) {
                const s = {
                    ocaCuit: data.ocaCuit || "",
                    ocaOperativa: data.ocaOperativa || "",
                    ocaOperativaSucursal: data.ocaOperativaSucursal || "",
                    ocaOriginZipCode: data.ocaOriginZipCode || "",
                    ocaEnabled: data.ocaEnabled ?? true,
                    dhlAccountNumber: data.dhlAccountNumber || "",
                    dhlApiKey: data.dhlApiKey || "",
                    dhlSiteId: data.dhlSiteId || "",
                    dhlEnabled: data.dhlEnabled ?? false
                };
                setSettings(s);
                setInitialSettings(s);
            }
        } catch (error) {
            console.error("Error fetching settings:", error);
        }
    };

    useEffect(() => {
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
                setLastSaved(true);
                setTimeout(() => setLastSaved(false), 3000);
                await fetchSettings();
            } else {
                showToast("Error al guardar configuración", "error");
            }
        } catch (error) {
            showToast("Error de conexión", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const hasChanges = JSON.stringify(settings) !== JSON.stringify(initialSettings);

    const inputCls = "w-full bg-[#141414] border border-white/10 rounded-2xl px-5 py-4 text-white text-[15px] focus:outline-none focus:border-white/20 focus:bg-[#1a1a1a] transition-all placeholder:text-white/10";
    const labelCls = "text-white/80 text-sm font-medium flex items-center gap-2.5";
    const hintCls = "text-[11px] text-white/20 italic mt-2 ml-1";
    const pendingBadge = "mb-8 p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-2xl flex items-center gap-3";

    return (
        <>
            <form onSubmit={handleSave}>
                <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">

                    {/* ── OCA ── */}
                    <div className="bg-[#0a0a0a] border border-white/5 rounded-[32px] p-10 md:p-12 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/5 blur-[120px] -z-10" />
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-primary/10 rounded-xl"><Truck className="h-6 w-6 text-primary" /></div>
                                    <h1 className="text-white text-3xl font-bold tracking-tight">OCA ePak</h1>
                                </div>
                                <p className="text-white/40 text-sm tracking-wide">Configurá las credenciales de tu cuenta corporativa de OCA.</p>
                            </div>
                            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${settings.ocaEnabled ? 'text-primary' : 'text-white/20'}`}>
                                    {settings.ocaEnabled ? 'Plataforma Activa' : 'Plataforma Inactiva'}
                                </span>
                                <button type="button" onClick={() => setSettings({ ...settings, ocaEnabled: !settings.ocaEnabled })}
                                    className={`relative w-14 h-7 rounded-full transition-all duration-300 ${settings.ocaEnabled ? 'bg-primary' : 'bg-white/10'}`}>
                                    <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-all duration-300 ${settings.ocaEnabled ? 'translate-x-7 shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'translate-x-0'}`} />
                                </button>
                            </div>
                        </div>

                        <div className={`grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8 transition-all duration-500 ${!settings.ocaEnabled ? 'opacity-30 pointer-events-none grayscale' : ''}`}>
                            <div className="space-y-3">
                                <label className={labelCls}><Hash className="h-4 w-4 text-white/60" /> CUIT</label>
                                <input type="text" placeholder="30-71458923-9" value={settings.ocaCuit}
                                    onChange={(e) => setSettings({ ...settings, ocaCuit: e.target.value })} className={inputCls} />
                                <p className={hintCls}>CUIT vinculado a tu cuenta de OCA.</p>
                            </div>
                            <div className="space-y-3">
                                <label className={labelCls}><Settings className="h-4 w-4 text-white/60" /> Operativa (Domicilio)</label>
                                <input type="text" placeholder="Ej: 236458" value={settings.ocaOperativa}
                                    onChange={(e) => setSettings({ ...settings, ocaOperativa: e.target.value })} className={inputCls} />
                                <p className={hintCls}>Operativa para entrega a domicilio.</p>
                            </div>
                            <div className="space-y-3">
                                <label className={labelCls}><Hash className="h-4 w-4 text-white/60" /> Operativa (Sucursal)</label>
                                <input type="text" placeholder="Ej: 236458" value={settings.ocaOperativaSucursal}
                                    onChange={(e) => setSettings({ ...settings, ocaOperativaSucursal: e.target.value })} className={inputCls} />
                                <p className={hintCls}>Operativa para retiro en sucursal OCA.</p>
                            </div>
                            <div className="space-y-3">
                                <label className={labelCls}><MapPin className="h-4 w-4 text-white/60" /> Código Postal de Origen</label>
                                <input type="text" placeholder="Ej: 2000" value={settings.ocaOriginZipCode}
                                    onChange={(e) => setSettings({ ...settings, ocaOriginZipCode: e.target.value })} className={inputCls} />
                                <p className={hintCls}>CP desde donde despachas tus pedidos.</p>
                            </div>
                        </div>
                    </div>

                    {/* ── DHL ── */}
                    <div className="bg-[#0a0a0a] border border-white/5 rounded-[32px] p-10 md:p-12 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-yellow-500/5 blur-[120px] -z-10" />
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-yellow-500/10 rounded-xl"><Globe className="h-6 w-6 text-yellow-400" /></div>
                                    <h2 className="text-white text-3xl font-bold tracking-tight">DHL Express</h2>
                                </div>
                                <p className="text-white/40 text-sm tracking-wide">Logística internacional. Configurá cuando recibas las credenciales del cliente.</p>
                            </div>
                            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${settings.dhlEnabled ? 'text-yellow-400' : 'text-white/20'}`}>
                                    {settings.dhlEnabled ? 'Plataforma Activa' : 'Plataforma Inactiva'}
                                </span>
                                <button type="button" onClick={() => setSettings({ ...settings, dhlEnabled: !settings.dhlEnabled })}
                                    className={`relative w-14 h-7 rounded-full transition-all duration-300 ${settings.dhlEnabled ? 'bg-yellow-500' : 'bg-white/10'}`}>
                                    <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-all duration-300 ${settings.dhlEnabled ? 'translate-x-7 shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'translate-x-0'}`} />
                                </button>
                            </div>
                        </div>

                        {!settings.dhlAccountNumber && !settings.dhlApiKey && !settings.dhlSiteId && (
                            <div className={pendingBadge}>
                                <div className="w-2 h-2 rounded-full bg-yellow-400/60 animate-pulse flex-shrink-0" />
                                <p className="text-[12px] text-yellow-400/60 font-medium">En espera de credenciales del cliente (developer.dhl.com).</p>
                            </div>
                        )}

                        <div className={`grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8 transition-all duration-500 ${!settings.dhlEnabled ? 'opacity-30 pointer-events-none grayscale' : ''}`}>
                            <div className="space-y-3">
                                <label className={labelCls}><Hash className="h-4 w-4 text-white/60" /> Account Number</label>
                                <input type="text" placeholder="Ej: 123456789" value={settings.dhlAccountNumber}
                                    onChange={(e) => setSettings({ ...settings, dhlAccountNumber: e.target.value })} className={inputCls} />
                                <p className={hintCls}>Número de cuenta DHL Express (9 dígitos).</p>
                            </div>
                            <div className="space-y-3">
                                <label className={labelCls}><Key className="h-4 w-4 text-white/60" /> Site ID</label>
                                <input type="text" placeholder="dhl_site_..." value={settings.dhlSiteId}
                                    onChange={(e) => setSettings({ ...settings, dhlSiteId: e.target.value })} className={inputCls} />
                                <p className={hintCls}>Identificador del sitio en la red DHL.</p>
                            </div>
                            <div className="space-y-3 md:col-span-2">
                                <label className={labelCls}><Lock className="h-4 w-4 text-white/60" /> API Key / Password</label>
                                <input type="password" placeholder="dhl_key_..." value={settings.dhlApiKey}
                                    onChange={(e) => setSettings({ ...settings, dhlApiKey: e.target.value })} className={inputCls} />
                                <p className={hintCls}>Clave de acceso a la API de DHL (Consumer Key).</p>
                            </div>
                        </div>
                    </div>

                    {/* ── Save Button (shared) ── */}
                    <div className="pt-2 pb-6">
                        <button type="submit" disabled={isSaving || (!hasChanges && !lastSaved)}
                            className={`w-full py-5 rounded-[20px] text-[16px] font-bold tracking-tight transition-all flex items-center justify-center gap-3 shadow-xl active:scale-[0.97] active:brightness-110 disabled:opacity-50 ${
                                isSaving ? 'bg-primary/20 text-primary border border-primary/20'
                                : lastSaved ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                : hasChanges ? 'bg-primary hover:bg-primary-dark text-white shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)]'
                                : 'bg-white/5 border border-white/10 text-white/20'
                            }`}>
                            {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
                            {!isSaving && lastSaved && <CheckCircle2 className="h-5 w-5 animate-in zoom-in duration-300" />}
                            {!isSaving && !lastSaved && hasChanges && <Save className="h-5 w-5" />}
                            {!isSaving && !lastSaved && !hasChanges && <CheckCircle2 className="h-5 w-5 opacity-40" />}
                            {isSaving ? 'Guardando...' : lastSaved ? '¡Configuración Actualizada! ✨' : hasChanges ? 'Guardar Configuración' : 'Configuración Actualizada'}
                        </button>
                    </div>
                </div>
            </form>

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
        </>
    );
}
