"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAuthStore } from "@/store/useAuthStore";
import { Plus, Trash2, Edit2, CheckCircle2, XCircle, Save, Percent, DollarSign, Tag, Monitor, Image as ImageIcon, Loader2 } from "lucide-react";

export default function MarketingPage() {
    const [activeTab, setActiveTab] = useState<"settings" | "coupons" | "popups">("settings");
    const { user } = useAuthStore();

    // Configuración Global
    const [settings, setSettings] = useState({
        freeShippingThreshold: 0,
        bankTransferDiscount: 15
    });
    const [isSavingSettings, setIsSavingSettings] = useState(false);

    // Toast Notification State
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    const showToast = (message: string, type: "success" | "error" = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    };

    // Cupones
    const [coupons, setCoupons] = useState<any[]>([]);
    const [isLoadingCoupons, setIsLoadingCoupons] = useState(true);
    const [isSubmittingCoupon, setIsSubmittingCoupon] = useState(false);

    const [couponForm, setCouponForm] = useState({
        code: "",
        discountType: "PERCENTAGE",
        discountValue: "",
        minPurchaseAmount: "",
        isActive: true
    });

    // Pop-ups
    const [popups, setPopups] = useState<any[]>([]);
    const [isLoadingPopups, setIsLoadingPopups] = useState(false);
    const [isSavingPopup, setIsSavingPopup] = useState<string | null>(null);

    // Estado para confirmación de eliminación en línea
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

    useEffect(() => {
        fetchSettings();
        fetchCoupons();
        fetchPopups();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch("/api/settings");
            const data = await res.json();
            if (data && !data.error) {
                setSettings({
                    freeShippingThreshold: data.freeShippingThreshold || 0,
                    bankTransferDiscount: data.bankTransferDiscount || 15
                });
            }
        } catch (error) {
            console.error("Error fetching settings:", error);
        }
    };

    const fetchCoupons = async () => {
        try {
            const res = await fetch("/api/coupons");
            const data = await res.json();
            if (Array.isArray(data)) {
                setCoupons(data);
            }
        } catch (error) {
            console.error("Error fetching coupons:", error);
        } finally {
            setIsLoadingCoupons(false);
        }
    };
    const fetchPopups = async () => {
        setIsLoadingPopups(true);
        try {
            const res = await fetch("/api/admin/popups");
            const data = await res.json();
            if (Array.isArray(data)) {
                setPopups(data);
            }
        } catch (error) {
            console.error("Error fetching popups:", error);
        } finally {
            setIsLoadingPopups(false);
        }
    };

    const handleSavePopup = async (location: string, imageUrl: string, isActive: boolean, displayFrequency?: string) => {
        setIsSavingPopup(location);
        try {
            const res = await fetch("/api/admin/popups", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    adminId: user?.id,
                    location,
                    imageUrl,
                    isActive,
                    displayFrequency: displayFrequency || "SESSION"
                })
            });

            if (res.ok) {
                showToast(`Pop-up de ${location} actualizado ✨`, "success");
                fetchPopups();
            } else {
                const errorData = await res.json();
                showToast(errorData.error || "Error al guardar pop-up", "error");
            }
        } catch (error) {
            showToast("Error de conexión", "error");
        } finally {
            setIsSavingPopup(null);
        }
    };

    const handleSaveSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingSettings(true);
        try {
            const res = await fetch("/api/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings)
            });
            if (res.ok) {
                showToast("Configuración guardada súper rápido 🚀", "success");
                window.dispatchEvent(new Event("settings-updated"));
            } else {
                showToast("Hubo un error al guardar", "error");
            }
        } catch (error) {
            showToast("Error de conexión", "error");
        } finally {
            setIsSavingSettings(false);
        }
    };

    const handleCreateCoupon = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!couponForm.code || !couponForm.discountValue) return;

        setIsSubmittingCoupon(true);
        try {
            const res = await fetch("/api/coupons", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(couponForm)
            });
            const data = await res.json();

            if (res.ok) {
                setCouponForm({ code: "", discountType: "PERCENTAGE", discountValue: "", minPurchaseAmount: "", isActive: true });
                showToast("¡Cupón mágico creado! ✨", "success");
                fetchCoupons();
            } else {
                showToast(data.error || "No pudimos crear el cupón", "error");
            }
        } catch (error) {
            showToast("Error de conexión al crear cupón", "error");
        } finally {
            setIsSubmittingCoupon(false);
        }
    };

    const handleToggleCoupon = async (id: string, currentStatus: boolean) => {
        try {
            const res = await fetch(`/api/coupons/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: !currentStatus })
            });
            if (res.ok) {
                showToast(currentStatus ? "Cupón desactivado 😴" : "Cupón activado ⚡️", "success");
                fetchCoupons();
            }
        } catch (error) {
            console.error("Error toggling coupon:", error);
            showToast("Error al cambiar estado", "error");
        }
    };

    const handleDeleteClick = (id: string) => {
        setConfirmDeleteId(id);
    };

    const confirmDeleteCoupon = async (id: string) => {
        try {
            const res = await fetch(`/api/coupons/${id}`, { method: "DELETE" });
            if (res.ok) {
                showToast("Cupón eliminado 🗑️", "success");
                fetchCoupons();
            }
        } catch (error) {
            console.error("Error deleting coupon:", error);
            showToast("No pudimos eliminarlo", "error");
        } finally {
            setConfirmDeleteId(null);
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-8 animate-in fade-in duration-700">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl font-light text-white font-montserrat tracking-tight">marketing & configs</h1>
                        <p className="text-white/40 text-[11px] uppercase tracking-widest">envío gratis, cupones y pop-ups</p>
                    </div>
                </div>

                {/* TABS */}
                <div className="flex items-center gap-4 border-b border-white/10 pb-4">
                    <button
                        onClick={() => setActiveTab("settings")}
                        className={`text-[12px] font-medium tracking-wide pb-2 px-1 border-b-2 transition-all ${activeTab === 'settings' ? 'text-primary border-primary' : 'text-white/40 border-transparent hover:text-white/70'}`}
                    >
                        Configuración Global
                    </button>
                    <button
                        onClick={() => setActiveTab("popups")}
                        className={`text-[12px] font-medium tracking-wide pb-2 px-1 border-b-2 transition-all ${activeTab === 'popups' ? 'text-primary border-primary' : 'text-white/40 border-transparent hover:text-white/70'}`}
                    >
                        Pop-ups Publicitarios
                    </button>
                    <button
                        onClick={() => setActiveTab("coupons")}
                        className={`text-[12px] font-medium tracking-wide pb-2 px-1 border-b-2 transition-all ${activeTab === 'coupons' ? 'text-primary border-primary' : 'text-white/40 border-transparent hover:text-white/70'}`}
                    >
                        Cupones de Descuento
                    </button>
                </div>

                {/* TAB 1: SETTINGS */}
                {activeTab === "settings" && (
                    <div className="max-w-2xl bg-white/[0.02] border border-white/5 rounded-3xl p-8">
                        <form onSubmit={handleSaveSettings} className="space-y-8">

                            <div className="space-y-4">
                                <div>
                                    <h2 className="text-white text-lg font-medium tracking-tight mb-1 flex items-center gap-2">
                                        <Truck className="h-5 w-5 text-primary" /> Umbral de Envío Gratis
                                    </h2>
                                    <p className="text-[12px] text-white/40">Si el subtotal del cliente supera este monto, el envío se vuelve gratuito. Ingresa 0 para desactivarlo.</p>
                                </div>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">$</span>
                                    <input
                                        type="number"
                                        value={settings.freeShippingThreshold}
                                        onChange={(e) => setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-4 py-4 text-[14px] text-white focus:outline-none focus:border-primary transition-colors font-mono"
                                    />
                                </div>
                            </div>

                            <hr className="border-white/10" />

                            <div className="space-y-4">
                                <div>
                                    <h2 className="text-white text-lg font-medium tracking-tight mb-1 flex items-center gap-2">
                                        <Percent className="h-5 w-5 text-primary" /> Descuento por Transferencia
                                    </h2>
                                    <p className="text-[12px] text-white/40">Porcentaje de descuento automático que se aplica cuando el cliente elige Transferencia Bancaria.</p>
                                </div>
                                <div className="relative">
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40">%</span>
                                    <input
                                        type="number"
                                        value={settings.bankTransferDiscount}
                                        onChange={(e) => setSettings({ ...settings, bankTransferDiscount: Number(e.target.value) })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-[14px] text-white focus:outline-none focus:border-primary transition-colors font-mono"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSavingSettings}
                                className="w-full bg-primary hover:bg-primary-dark text-white py-4 rounded-xl text-[13px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg hover:-translate-y-0.5"
                            >
                                {isSavingSettings ? <Save className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                Guardar Configuraciones
                            </button>
                        </form>
                    </div>
                )}

                {/* TAB 2: COUPONS */}
                {activeTab === "coupons" && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Formulario */}
                        <div className="lg:col-span-1 space-y-6">
                            <form onSubmit={handleCreateCoupon} className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 space-y-4">
                                <h2 className="text-[14px] text-white font-medium mb-4 flex items-center gap-2">
                                    <Tag className="h-4 w-4 text-primary" /> Crear Cupón
                                </h2>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1">Código (Ej: VERANO20)</label>
                                    <input
                                        type="text"
                                        value={couponForm.code}
                                        onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[13px] text-white focus:outline-none focus:border-primary transition-colors uppercase font-mono"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1">Tipo</label>
                                        <select
                                            value={couponForm.discountType}
                                            onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[13px] text-white focus:outline-none focus:border-primary transition-colors appearance-none"
                                        >
                                            <option value="PERCENTAGE">Porcentaje (%)</option>
                                            <option value="FIXED">Monto Fijo ($)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1">Valor</label>
                                        <input
                                            type="number"
                                            value={couponForm.discountValue}
                                            onChange={(e) => setCouponForm({ ...couponForm, discountValue: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[13px] text-white focus:outline-none focus:border-primary transition-colors"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1">Monto de Compra Mínima (Opcional)</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">$</span>
                                        <input
                                            type="number"
                                            value={couponForm.minPurchaseAmount}
                                            onChange={(e) => setCouponForm({ ...couponForm, minPurchaseAmount: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-7 pr-3 py-3 text-[13px] text-white focus:outline-none focus:border-primary transition-colors"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmittingCoupon}
                                    className="w-full bg-primary hover:bg-primary-dark text-white py-3 rounded-xl text-[12px] font-medium transition-all flex items-center justify-center gap-2 mt-4"
                                >
                                    {isSubmittingCoupon ? <Plus className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                                    Crear Cupón
                                </button>
                            </form>
                        </div>

                        {/* Listado */}
                        <div className="lg:col-span-2">
                            <div className="bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-white/5 bg-white/[0.02]">
                                                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-medium">Código</th>
                                                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-medium">Descuento</th>
                                                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-medium">Condiciones</th>
                                                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-medium text-right">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {isLoadingCoupons ? (
                                                <tr>
                                                    <td colSpan={4} className="px-6 py-12 text-center text-white/20 text-[11px] uppercase tracking-widest">
                                                        Cargando cupones...
                                                    </td>
                                                </tr>
                                            ) : coupons.length === 0 ? (
                                                <tr>
                                                    <td colSpan={4} className="px-6 py-12 text-center text-white/20 text-[11px] uppercase tracking-widest">
                                                        No hay cupones creados.
                                                    </td>
                                                </tr>
                                            ) : coupons.map((c) => (
                                                <tr key={c.id} className={`hover:bg-white/[0.02] transition-colors group ${!c.isActive ? 'opacity-50 grayscale' : ''}`}>
                                                    <td className="px-6 py-4">
                                                        <span className="text-[13px] font-bold text-primary font-mono bg-primary/10 px-2 py-1 rounded">
                                                            {c.code}
                                                        </span>
                                                        {!c.isActive && <span className="ml-2 text-[9px] text-red-400 border border-red-400/20 px-1.5 py-0.5 rounded uppercase font-bold tracking-widest">Inactivo</span>}
                                                    </td>
                                                    <td className="px-6 py-4 text-[13px] text-white">
                                                        {c.discountType === 'PERCENTAGE' ? `${c.discountValue}% OFF` : `$${c.discountValue.toLocaleString('es-AR')} OFF`}
                                                    </td>
                                                    <td className="px-6 py-4 text-[11px] text-white/60">
                                                        {c.minPurchaseAmount ? `Compra mín. $${c.minPurchaseAmount.toLocaleString('es-AR')}` : 'Sin restricciones'}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center justify-end gap-3 transition-opacity">
                                                            {confirmDeleteId === c.id ? (
                                                                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-300">
                                                                    <button
                                                                        onClick={() => confirmDeleteCoupon(c.id)}
                                                                        className="text-[10px] bg-red-500/20 text-red-500 border border-red-500/30 px-2 py-1 rounded hover:bg-red-500 hover:text-white transition-all font-bold uppercase tracking-tight"
                                                                    >
                                                                        Borrar
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setConfirmDeleteId(null)}
                                                                        className="text-[10px] text-white/40 hover:text-white transition-colors uppercase font-medium"
                                                                    >
                                                                        No
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <button
                                                                        onClick={() => handleToggleCoupon(c.id, c.isActive)}
                                                                        title={c.isActive ? "Desactivar" : "Activar"}
                                                                        className="text-white/40 hover:text-white"
                                                                    >
                                                                        {c.isActive ? <XCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteClick(c.id)}
                                                                        title="Eliminar"
                                                                        className="text-red-400/60 hover:text-red-400"
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "popups" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {["HOME", "SHOP"].map((loc) => {
                            const popup = popups.find(p => p.location === loc) || { location: loc, imageUrl: "", isActive: false, displayFrequency: "SESSION" };
                            return (
                                <div key={loc} className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                                <Monitor className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <h3 className="text-white font-medium tracking-tight">Pop-up {loc === 'HOME' ? 'Inicio' : 'Tienda'}</h3>
                                                <p className="text-[11px] text-white/40 uppercase tracking-widest">Configuración visual</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleSavePopup(loc, popup.imageUrl, !popup.isActive, popup.displayFrequency)}
                                            className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${popup.isActive ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-white/5 text-white/40 border border-white/10'}`}
                                        >
                                            {popup.isActive ? 'Activo' : 'Inactivo'}
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="bg-black/20 rounded-2xl p-4 border border-white/5">
                                            <div className="flex items-center justify-between mb-4">
                                                <span className="text-[11px] text-white/60 font-medium">Imagen del Pop-up</span>
                                                <span className="text-[10px] text-primary/60 font-mono italic">Tamaño flexible</span>
                                            </div>

                                            {popup.imageUrl ? (
                                                <div className="relative min-h-[200px] max-h-[400px] w-full rounded-xl overflow-hidden border border-white/10 group mb-4 bg-black/40 flex items-center justify-center">
                                                    <img src={popup.imageUrl} alt="Popup Preview" className="max-w-full max-h-[400px] object-contain" />
                                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                                        <input
                                                            type="file"
                                                            id={`file-${loc}`}
                                                            className="hidden"
                                                            onChange={async (e) => {
                                                                const file = e.target.files?.[0];
                                                                if (!file) return;
                                                                const formData = new FormData();
                                                                formData.append('file', file);
                                                                const res = await fetch('/api/upload', { method: 'POST', body: formData });
                                                                const data = await res.json();
                                                                if (data.url) {
                                                                    handleSavePopup(loc, data.url, popup.isActive, popup.displayFrequency);
                                                                }
                                                            }}
                                                        />
                                                        <button
                                                            onClick={() => document.getElementById(`file-${loc}`)?.click()}
                                                            className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all backdrop-blur-md"
                                                        >
                                                            <Edit2 className="h-5 w-5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="aspect-[4/5] w-full rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-3 hover:bg-white/[0.02] transition-all cursor-pointer group"
                                                    onClick={() => document.getElementById(`file-${loc}`)?.click()}>
                                                    <input
                                                        type="file"
                                                        id={`file-${loc}`}
                                                        className="hidden"
                                                        onChange={async (e) => {
                                                            const file = e.target.files?.[0];
                                                            if (!file) return;
                                                            const formData = new FormData();
                                                            formData.append('file', file);
                                                            const res = await fetch('/api/upload', { method: 'POST', body: formData });
                                                            const data = await res.json();
                                                            if (data.url) {
                                                                handleSavePopup(loc, data.url, popup.isActive, popup.displayFrequency);
                                                            }
                                                        }}
                                                    />
                                                    <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                        <ImageIcon className="h-6 w-6 text-white/20" />
                                                    </div>
                                                    <p className="text-[12px] text-white/40">Subir imagen</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="bg-black/20 rounded-2xl p-4 border border-white/5 space-y-3">
                                            <label className="text-[11px] text-white/60 font-medium">Frecuencia de aparición</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                <button
                                                    onClick={() => handleSavePopup(loc, popup.imageUrl, popup.isActive, "SESSION")}
                                                    className={`py-2 px-3 rounded-lg text-[10px] font-bold uppercase tracking-tight transition-all border ${popup.displayFrequency === 'SESSION' ? 'bg-primary/10 border-primary/40 text-primary' : 'bg-white/5 border-white/10 text-white/40 hover:text-white/60'}`}
                                                >
                                                    Una vez por sesión
                                                </button>
                                                <button
                                                    onClick={() => handleSavePopup(loc, popup.imageUrl, popup.isActive, "ALWAYS")}
                                                    className={`py-2 px-3 rounded-lg text-[10px] font-bold uppercase tracking-tight transition-all border ${popup.displayFrequency === 'ALWAYS' ? 'bg-primary/10 border-primary/40 text-primary' : 'bg-white/5 border-white/10 text-white/40 hover:text-white/60'}`}
                                                >
                                                    Siempre que ingresen
                                                </button>
                                            </div>
                                        </div>

                                        <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4">
                                            <p className="text-[11px] text-primary/80 leading-relaxed italic">
                                                "Este pop-up se mostrará automáticamente a los visitantes en la página de {loc === 'HOME' ? 'Inicio' : 'Tienda'} cuando esté activo."
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        disabled={isSavingPopup === loc}
                                        onClick={() => handleSavePopup(loc, popup.imageUrl, popup.isActive, popup.displayFrequency)}
                                        className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[12px] font-bold uppercase tracking-widest text-white transition-all flex items-center justify-center gap-3"
                                    >
                                        {isSavingPopup === loc ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 text-primary" />}
                                        Actualizar Pop-up
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* SLEEK TOAST NOTIFICATION OVERLAY */}
            {toast && (
                <div className="fixed bottom-24 right-8 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-300">
                    <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-md ${toast.type === 'success'
                        ? 'bg-[#1a3f2d]/90 border-primary text-white'
                        : 'bg-red-950/90 border-red-500/50 text-red-200'
                        }`}>
                        {toast.type === 'success' ? (
                            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                                <CheckCircle2 className="h-5 w-5 text-green-400" />
                            </div>
                        ) : (
                            <div className="h-8 w-8 rounded-full bg-red-500/20 flex items-center justify-center">
                                <XCircle className="h-5 w-5 text-red-400" />
                            </div>
                        )}
                        <div>
                            <p className="text-sm font-semibold tracking-wide">
                                {toast.type === 'success' ? '¡Todo listo!' : '¡Ups! Algo falló'}
                            </p>
                            <p className="text-xs opacity-80 mt-0.5">{toast.message}</p>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

// simple mock truck since not correctly imported
function Truck(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" /><path d="M15 18H9" /><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" /><circle cx="17" cy="18" r="2" /><circle cx="7" cy="18" r="2" /></svg>
    );
}
