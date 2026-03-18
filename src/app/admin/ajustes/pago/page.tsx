"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAuthStore } from "@/store/useAuthStore";
import { 
    CreditCard, 
    Key, 
    Lock, 
    Save, 
    Loader2, 
    CheckCircle2, 
    XCircle,
    Hash,
    Globe
} from "lucide-react";

export default function PagoPage() {
    const { user } = useAuthStore();
    const [isSaving, setIsSaving] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    const [settings, setSettings] = useState({
        mercadopagoPublicKey: "",
        mercadopagoAccessToken: "",
        mercadopagoEnabled: true,
        bankTransferCbu: "",
        bankTransferAlias: "",
        bankTransferDiscount: 15,
        modoPublicKey: "",
        modoPrivateKey: "",
        modoMerchantId: "",
        modoEnabled: false,
        paypalClientId: "",
        paypalSecret: "",
        paypalEnabled: false
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
                    mercadopagoPublicKey: data.mercadopagoPublicKey || "",
                    mercadopagoAccessToken: data.mercadopagoAccessToken || "",
                    mercadopagoEnabled: data.mercadopagoEnabled ?? true,
                    bankTransferCbu: data.bankTransferCbu || "",
                    bankTransferAlias: data.bankTransferAlias || "",
                    bankTransferDiscount: data.bankTransferDiscount ?? 15,
                    modoPublicKey: data.modoPublicKey || "",
                    modoPrivateKey: data.modoPrivateKey || "",
                    modoMerchantId: data.modoMerchantId || "",
                    modoEnabled: data.modoEnabled ?? false,
                    paypalClientId: data.paypalClientId || "",
                    paypalSecret: data.paypalSecret || "",
                    paypalEnabled: data.paypalEnabled ?? false
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
                // Notify other components (like the Header) to refresh
                window.dispatchEvent(new Event("settings-updated"));
            } else {
                showToast("Error al guardar credenciales", "error");
            }
        } catch (error) {
            showToast("Error de conexión", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const hasChanges = JSON.stringify(settings) !== JSON.stringify(initialSettings);

    const inputCls = "w-full bg-[#141414] border border-white/10 rounded-2xl px-5 py-4 text-white text-[15px] focus:outline-none focus:border-white/20 focus:bg-[#1a1a1a] transition-all placeholder:text-white/10 font-mono";
    const labelCls = "text-white/80 text-sm font-medium flex items-center gap-2.5";
    const hintCls = "text-[11px] text-white/20 italic mt-2 ml-1";
    const pendingBadge = "mb-8 p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-2xl flex items-center gap-3";

    const PlatformToggle = ({ enabled, color, onToggle }: { enabled: boolean; color: string; onToggle: () => void }) => (
        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
            <span className={`text-[10px] font-bold uppercase tracking-widest ${enabled ? color : 'text-white/20'}`}>
                {enabled ? 'Plataforma Activa' : 'Plataforma Inactiva'}
            </span>
            <button
                type="button"
                onClick={onToggle}
                className={`relative w-14 h-7 rounded-full transition-all duration-300 ${enabled ? 'bg-current' : 'bg-white/10'}`}
                style={enabled ? { backgroundColor: 'currentColor' } : {}}
            >
                <div style={enabled ? { backgroundColor: 'white', boxShadow: '0 0 10px rgba(255,255,255,0.5)' } : { backgroundColor: 'white' }}
                    className={`absolute top-1 left-1 w-5 h-5 rounded-full transition-all duration-300 ${enabled ? 'translate-x-7' : 'translate-x-0'}`} />
            </button>
        </div>
    );

    return (
        <AdminLayout>
            <form onSubmit={handleSave}>
                <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">

                    {/* ── Mercado Pago ── */}
                    <div className="bg-[#0a0a0a] border border-white/5 rounded-[32px] p-10 md:p-12 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/5 blur-[120px] -z-10" />
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-primary/10 rounded-xl"><CreditCard className="h-6 w-6 text-primary" /></div>
                                    <h1 className="text-white text-3xl font-bold tracking-tight">Mercado Pago</h1>
                                </div>
                                <p className="text-white/40 text-sm tracking-wide">Vinculá tu cuenta para cobrar en tu tienda.</p>
                            </div>
                            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${settings.mercadopagoEnabled ? 'text-primary' : 'text-white/20'}`}>
                                    {settings.mercadopagoEnabled ? 'Plataforma Activa' : 'Plataforma Inactiva'}
                                </span>
                                <button type="button" onClick={() => setSettings({ ...settings, mercadopagoEnabled: !settings.mercadopagoEnabled })}
                                    className={`relative w-14 h-7 rounded-full transition-all duration-300 ${settings.mercadopagoEnabled ? 'bg-primary' : 'bg-white/10'}`}>
                                    <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-all duration-300 ${settings.mercadopagoEnabled ? 'translate-x-7 shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'translate-x-0'}`} />
                                </button>
                            </div>
                        </div>
                        <div className={`grid grid-cols-1 gap-y-8 transition-all duration-500 ${!settings.mercadopagoEnabled ? 'opacity-30 pointer-events-none grayscale' : ''}`}>
                            <div className="space-y-3">
                                <label className={labelCls}><Key className="h-4 w-4 text-white/60" /> Public Key</label>
                                <input type="text" placeholder="APP_USR-..." value={settings.mercadopagoPublicKey}
                                    onChange={(e) => setSettings({ ...settings, mercadopagoPublicKey: e.target.value })} className={inputCls} />
                                <p className={hintCls}>Identificador público de tu aplicación.</p>
                            </div>
                            <div className="space-y-3">
                                <label className={labelCls}><Lock className="h-4 w-4 text-white/60" /> Access Token</label>
                                <input type="password" placeholder="APP_USR-..." value={settings.mercadopagoAccessToken}
                                    onChange={(e) => setSettings({ ...settings, mercadopagoAccessToken: e.target.value })} className={inputCls} />
                                <p className={hintCls}>Token privado para procesar pagos de forma segura.</p>
                            </div>
                        </div>
                    </div>

                    {/* ── Transferencia Bancaria ── */}
                    <div className="bg-[#0a0a0a] border border-white/5 rounded-[32px] p-10 md:p-12 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-green-500/5 blur-[120px] -z-10" />
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-green-500/10 rounded-xl">
                                        <Hash className="h-6 w-6 text-green-400" />
                                    </div>
                                    <h2 className="text-white text-3xl font-bold tracking-tight">Transferencia Bancaria</h2>
                                </div>
                                <p className="text-white/40 text-sm tracking-wide">El CBU y alias que verá el cliente al elegir transferencia como medio de pago.</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-8">
                            <div className="space-y-3">
                                <label className={labelCls}><Hash className="h-4 w-4 text-white/60" /> CBU</label>
                                <input type="text" placeholder="Ej: 0720000188000009876543"
                                    value={settings.bankTransferCbu}
                                    onChange={(e) => setSettings({ ...settings, bankTransferCbu: e.target.value })}
                                    className={inputCls} />
                                <p className={hintCls}>Número de CBU de la cuenta bancaria del negocio.</p>
                            </div>
                            <div className="space-y-3">
                                <label className={labelCls}><Key className="h-4 w-4 text-white/60" /> Alias</label>
                                <input type="text" placeholder="Ej: ARAI.TIENDA.MP"
                                    value={settings.bankTransferAlias}
                                    onChange={(e) => setSettings({ ...settings, bankTransferAlias: e.target.value })}
                                    className={inputCls} />
                                <p className={hintCls}>Alias de la cuenta para facilitar la transferencia.</p>
                            </div>
                            <div className="space-y-3">
                                <label className={labelCls}><Globe className="h-4 w-4 text-white/60" /> Descuento (%)</label>
                                <input type="number" placeholder="Ej: 15"
                                    value={settings.bankTransferDiscount}
                                    onChange={(e) => setSettings({ ...settings, bankTransferDiscount: Number(e.target.value) })}
                                    className={inputCls} />
                                <p className={hintCls}>% de descuento que se aplica automáticamente.</p>
                            </div>
                        </div>
                    </div>

                    {/* ── Modo ── */}
                    <div className="bg-[#0a0a0a] border border-white/5 rounded-[32px] p-10 md:p-12 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-blue-500/5 blur-[120px] -z-10" />
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-blue-500/10 rounded-xl"><CreditCard className="h-6 w-6 text-blue-400" /></div>
                                    <h2 className="text-white text-3xl font-bold tracking-tight">Modo</h2>
                                </div>
                                <p className="text-white/40 text-sm tracking-wide">Wallet digital argentino. Configurá cuando recibas las credenciales del cliente.</p>
                            </div>
                            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${settings.modoEnabled ? 'text-blue-400' : 'text-white/20'}`}>
                                    {settings.modoEnabled ? 'Plataforma Activa' : 'Plataforma Inactiva'}
                                </span>
                                <button type="button" onClick={() => setSettings({ ...settings, modoEnabled: !settings.modoEnabled })}
                                    className={`relative w-14 h-7 rounded-full transition-all duration-300 ${settings.modoEnabled ? 'bg-blue-500' : 'bg-white/10'}`}>
                                    <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-all duration-300 ${settings.modoEnabled ? 'translate-x-7 shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'translate-x-0'}`} />
                                </button>
                            </div>
                        </div>
                        {!settings.modoPublicKey && !settings.modoPrivateKey && !settings.modoMerchantId && (
                            <div className={pendingBadge}>
                                <div className="w-2 h-2 rounded-full bg-yellow-400/60 animate-pulse flex-shrink-0" />
                                <p className="text-[12px] text-yellow-400/60 font-medium">En espera de credenciales del cliente.</p>
                            </div>
                        )}
                        <div className={`grid grid-cols-1 gap-y-8 transition-all duration-500 ${!settings.modoEnabled ? 'opacity-30 pointer-events-none grayscale' : ''}`}>
                            <div className="space-y-3">
                                <label className={labelCls}><Key className="h-4 w-4 text-white/60" /> Public Key</label>
                                <input type="text" placeholder="modo_pk_..." value={settings.modoPublicKey}
                                    onChange={(e) => setSettings({ ...settings, modoPublicKey: e.target.value })} className={inputCls} />
                                <p className={hintCls}>Clave pública provista por Modo para el frontend.</p>
                            </div>
                            <div className="space-y-3">
                                <label className={labelCls}><Lock className="h-4 w-4 text-white/60" /> Private Key / Secret</label>
                                <input type="password" placeholder="modo_sk_..." value={settings.modoPrivateKey}
                                    onChange={(e) => setSettings({ ...settings, modoPrivateKey: e.target.value })} className={inputCls} />
                                <p className={hintCls}>Clave privada para procesar pagos de forma segura.</p>
                            </div>
                            <div className="space-y-3">
                                <label className={labelCls}><Hash className="h-4 w-4 text-white/60" /> Merchant ID</label>
                                <input type="text" placeholder="merchant_12345" value={settings.modoMerchantId}
                                    onChange={(e) => setSettings({ ...settings, modoMerchantId: e.target.value })} className={inputCls} />
                                <p className={hintCls}>Identificador único del comercio en la red de Modo.</p>
                            </div>
                        </div>
                    </div>

                    {/* ── PayPal ── */}
                    <div className="bg-[#0a0a0a] border border-white/5 rounded-[32px] p-10 md:p-12 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-sky-500/5 blur-[120px] -z-10" />
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-sky-500/10 rounded-xl"><Globe className="h-6 w-6 text-sky-400" /></div>
                                    <h2 className="text-white text-3xl font-bold tracking-tight">PayPal</h2>
                                </div>
                                <p className="text-white/40 text-sm tracking-wide">Pagos internacionales en USD. Configurá cuando recibas las credenciales del cliente.</p>
                            </div>
                            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${settings.paypalEnabled ? 'text-sky-400' : 'text-white/20'}`}>
                                    {settings.paypalEnabled ? 'Plataforma Activa' : 'Plataforma Inactiva'}
                                </span>
                                <button type="button" onClick={() => setSettings({ ...settings, paypalEnabled: !settings.paypalEnabled })}
                                    className={`relative w-14 h-7 rounded-full transition-all duration-300 ${settings.paypalEnabled ? 'bg-sky-500' : 'bg-white/10'}`}>
                                    <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-all duration-300 ${settings.paypalEnabled ? 'translate-x-7 shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'translate-x-0'}`} />
                                </button>
                            </div>
                        </div>
                        {!settings.paypalClientId && !settings.paypalSecret && (
                            <div className={pendingBadge}>
                                <div className="w-2 h-2 rounded-full bg-yellow-400/60 animate-pulse flex-shrink-0" />
                                <p className="text-[12px] text-yellow-400/60 font-medium">En espera de credenciales del cliente (developer.paypal.com).</p>
                            </div>
                        )}
                        <div className={`grid grid-cols-1 gap-y-8 transition-all duration-500 ${!settings.paypalEnabled ? 'opacity-30 pointer-events-none grayscale' : ''}`}>
                            <div className="space-y-3">
                                <label className={labelCls}><Key className="h-4 w-4 text-white/60" /> Client ID</label>
                                <input type="text" placeholder="AaX..." value={settings.paypalClientId}
                                    onChange={(e) => setSettings({ ...settings, paypalClientId: e.target.value })} className={inputCls} />
                                <p className={hintCls}>Clave pública de la aplicación de PayPal (Sandbox o Live).</p>
                            </div>
                            <div className="space-y-3">
                                <label className={labelCls}><Lock className="h-4 w-4 text-white/60" /> Secret Key</label>
                                <input type="password" placeholder="EGa..." value={settings.paypalSecret}
                                    onChange={(e) => setSettings({ ...settings, paypalSecret: e.target.value })} className={inputCls} />
                                <p className={hintCls}>Clave privada para procesar pagos de forma segura.</p>
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
                            {isSaving ? 'Guardando...' : lastSaved ? '¡Credenciales Actualizadas! ✨' : hasChanges ? 'Guardar Credenciales' : 'Credenciales Actualizadas'}
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
        </AdminLayout>
    );
}
