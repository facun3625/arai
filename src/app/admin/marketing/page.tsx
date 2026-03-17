"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAuthStore } from "@/store/useAuthStore";
import { Plus, Trash2, Edit2, CheckCircle2, XCircle, Save, Percent, DollarSign, Tag, Monitor, Image as ImageIcon, Loader2, Coins, Gift, Settings2, Sparkles, Truck, Instagram, Facebook, Twitter, Mail, Send, ExternalLink, Users } from "lucide-react";
import { TikTokIcon } from "@/components/icons/TikTokIcon";

export default function MarketingPage() {
    const [activeTab, setActiveTab] = useState<"settings" | "coupons" | "popups" | "points" | "user-coupons" | "email-marketing">("settings");
    const [searchQuery, setSearchQuery] = useState("");
    const { user } = useAuthStore();

    // Configuración Global
    const [settings, setSettings] = useState({
        freeShippingThreshold: 0,
        bankTransferDiscount: 15,
        pointsEnabled: false,
        pointsRatio: 0.01,
        instagramUrl: "",
        facebookUrl: "",
        xUrl: "",
        youtubeUrl: "",
        tiktokUrl: "",
        whatsappNumber: "",
        maintenanceMode: false
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

    // Puntos y Recompensas
    const [rewards, setRewards] = useState<any[]>([]);
    const [isLoadingRewards, setIsLoadingRewards] = useState(false);
    const [isSavingReward, setIsSavingReward] = useState(false);
    const [rewardForm, setRewardForm] = useState({
        id: "",
        title: "",
        pointsRequired: "",
        discountValue: "",
        discountType: "FIXED",
        isActive: true
    });

    // Estado para confirmación de eliminación en línea
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

    // Email Marketing
    const [subscribersCount, setSubscribersCount] = useState(0);
    const [isSendingEmail, setIsSendingEmail] = useState(false);
    const [audienceStats, setAudienceStats] = useState<any>({});
    const [emailForm, setEmailForm] = useState({
        subject: "",
        content: "",
        buttonText: "",
        buttonUrl: "",
        audience: "ALL"
    });
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(false);
    
    // Confirmation Modal State
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    useEffect(() => {
        fetchSettings();
        fetchCoupons();
        fetchPopups();
        fetchRewards();
        fetchAudienceStats();
        fetchCampaigns();
    }, []);

    const fetchCampaigns = async () => {
        setIsLoadingCampaigns(true);
        try {
            const res = await fetch(`/api/admin/marketing/campaigns?adminId=${user?.id}`);
            const data = await res.json();
            if (data.campaigns) {
                setCampaigns(data.campaigns);
            }
        } catch (error) {
            console.error("Error fetching campaigns:", error);
        } finally {
            setIsLoadingCampaigns(false);
        }
    };

    const fetchAudienceStats = async () => {
        try {
            const res = await fetch(`/api/admin/marketing/audience-stats?adminId=${user?.id}`);
            const data = await res.json();
            if (data.stats) {
                setAudienceStats(data.stats);
                setSubscribersCount(data.stats.ALL || 0);
            }
        } catch (error) {
            console.error("Error fetching audience stats:", error);
        }
    };

    const fetchSettings = async () => {
        try {
            const res = await fetch("/api/settings");
            const data = await res.json();
            if (data && !data.error) {
                setSettings({
                    freeShippingThreshold: data.freeShippingThreshold || 0,
                    bankTransferDiscount: data.bankTransferDiscount || 15,
                    pointsEnabled: data.pointsEnabled || false,
                    pointsRatio: data.pointsRatio || 0.01,
                    instagramUrl: data.instagramUrl || "",
                    facebookUrl: data.facebookUrl || "",
                    xUrl: data.xUrl || "",
                    youtubeUrl: data.youtubeUrl || "",
                    tiktokUrl: data.tiktokUrl || "",
                    whatsappNumber: data.whatsappNumber || "",
                    maintenanceMode: data.maintenanceMode || false
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
    const fetchRewards = async () => {
        setIsLoadingRewards(true);
        try {
            const res = await fetch("/api/admin/rewards");
            const data = await res.json();
            if (Array.isArray(data)) {
                setRewards(data);
            }
        } catch (error) {
            console.error("Error fetching rewards:", error);
        } finally {
            setIsLoadingRewards(false);
        }
    };

    const handleSaveReward = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingReward(true);
        try {
            const res = await fetch("/api/admin/rewards", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...rewardForm, adminId: user?.id })
            });
            if (res.ok) {
                showToast(rewardForm.id ? "Recompensa actualizada ✨" : "Recompensa creada ✨", "success");
                setRewardForm({ id: "", title: "", pointsRequired: "", discountValue: "", discountType: "FIXED", isActive: true });
                fetchRewards();
            } else {
                showToast("Error al guardar recompensa", "error");
            }
        } catch (error) {
            showToast("Error de conexión", "error");
        } finally {
            setIsSavingReward(false);
        }
    };

    const handleDeleteReward = async (id: string) => {
        try {
            const res = await fetch(`/api/admin/rewards?id=${id}&adminId=${user?.id}`, { method: "DELETE" });
            if (res.ok) {
                showToast("Recompensa eliminada 🗑️", "success");
                fetchRewards();
            }
        } catch (error) {
            showToast("Error al eliminar", "error");
        } finally {
            setConfirmDeleteId(null);
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

    const handleSendEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!emailForm.subject || !emailForm.content) {
            showToast("Asunto y contenido son obligatorios", "error");
            return;
        }

        setShowConfirmModal(true);
    };

    const confirmAndSendEmail = async () => {
        setShowConfirmModal(false);
        setIsSendingEmail(true);
        try {
            const res = await fetch("/api/admin/marketing/send-mass-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...emailForm,
                    adminId: user?.id
                })
            });

            const data = await res.json();
            if (res.ok) {
                showToast(`¡Campaña enviada con éxito! 🚀`, "success");
                setEmailForm({ subject: "", content: "", buttonText: "", buttonUrl: "", audience: "ALL", customEmailsRaw: "", customEmails: [] } as any);
                fetchCampaigns();
            } else {
                showToast(data.error || "Error al enviar el correo", "error");
            }
        } catch (error) {
            showToast("Error de conexión al enviar correo", "error");
        } finally {
            setIsSendingEmail(false);
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
                        onClick={() => setActiveTab("points")}
                        className={`text-[12px] font-medium tracking-wide pb-2 px-1 border-b-2 transition-all ${activeTab === 'points' ? 'text-primary border-primary' : 'text-white/40 border-transparent hover:text-white/70'}`}
                    >
                        Sistema de Puntos
                    </button>
                    <button
                        onClick={() => setActiveTab("coupons")}
                        className={`text-[12px] font-medium tracking-wide pb-2 px-1 border-b-2 transition-all ${activeTab === 'coupons' ? 'text-primary border-primary' : 'text-white/40 border-transparent hover:text-white/70'}`}
                    >
                        Cupones de Descuento
                    </button>
                    <button
                        onClick={() => setActiveTab("user-coupons")}
                        className={`text-[12px] font-medium tracking-wide pb-2 px-1 border-b-2 transition-all ${activeTab === 'user-coupons' ? 'text-primary border-primary' : 'text-white/40 border-transparent hover:text-white/70'}`}
                    >
                        Canjes de Usuarios
                    </button>
                    <button
                        onClick={() => setActiveTab("email-marketing")}
                        className={`text-[12px] font-medium tracking-wide pb-2 px-1 border-b-2 transition-all ${activeTab === 'email-marketing' ? 'text-primary border-primary' : 'text-white/40 border-transparent hover:text-white/70'}`}
                    >
                        Email Marketing
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

                            <hr className="border-white/10" />

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-white text-lg font-medium tracking-tight mb-1 flex items-center gap-2">
                                            <Monitor className="h-5 w-5 text-red-500" /> Modo Mantenimiento
                                        </h2>
                                        <p className="text-[12px] text-white/40 italic">Bloquea el acceso al sitio para todos excepto administradores y testers.</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${settings.maintenanceMode 
                                            ? 'bg-red-500/20 text-red-500 border border-red-500/30' 
                                            : 'bg-white/5 text-white/40 border border-white/10 hover:border-white/20'}`}
                                    >
                                        {settings.maintenanceMode ? 'ACTIVO (SITIO CERRADO)' : 'DESACTIVADO (SITIO PÚBLICO)'}
                                    </button>
                                </div>
                                {settings.maintenanceMode && (
                                    <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300">
                                        <p className="text-[11px] text-red-400 leading-relaxed italic">
                                            ⚠️ <strong>Atención:</strong> El sitio mostrará un cartel de "En Mantenimiento" a todos los visitantes. 
                                            Como administrador, tu acceso sigue habilitado para que puedas realizar pruebas.
                                        </p>
                                    </div>
                                )}
                            </div>

                            <hr className="border-white/10" />

                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-white text-lg font-medium tracking-tight mb-1">
                                        Redes Sociales y WhatsApp
                                    </h2>
                                    <p className="text-[12px] text-white/40">Configurá los enlaces que aparecerán en el Header y Footer del sitio.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[11px] text-white/60 font-medium uppercase tracking-widest flex items-center gap-2">
                                            <Instagram className="h-3.5 w-3.5" /> Instagram
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="https://instagram.com/tu-usuario"
                                            value={settings.instagramUrl || ""}
                                            onChange={(e) => setSettings({ ...settings, instagramUrl: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[13px] text-white focus:outline-none focus:border-primary transition-colors"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[11px] text-white/60 font-medium uppercase tracking-widest flex items-center gap-2">
                                            <Facebook className="h-3.5 w-3.5" /> Facebook
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="https://facebook.com/tu-pagina"
                                            value={settings.facebookUrl || ""}
                                            onChange={(e) => setSettings({ ...settings, facebookUrl: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[13px] text-white focus:outline-none focus:border-primary transition-colors"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[11px] text-white/60 font-medium uppercase tracking-widest flex items-center gap-2">
                                            <Twitter className="h-3.5 w-3.5" /> X (Ex Twitter)
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="https://x.com/tu-usuario"
                                            value={settings.xUrl || ""}
                                            onChange={(e) => setSettings({ ...settings, xUrl: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[13px] text-white focus:outline-none focus:border-primary transition-colors"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[11px] text-white/60 font-medium uppercase tracking-widest flex items-center gap-2">
                                            <Monitor className="h-3.5 w-3.5" /> YouTube
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="https://youtube.com/@tu-canal"
                                            value={settings.youtubeUrl || ""}
                                            onChange={(e) => setSettings({ ...settings, youtubeUrl: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[13px] text-white focus:outline-none focus:border-primary transition-colors"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[11px] text-white/60 font-medium uppercase tracking-widest flex items-center gap-2">
                                            <TikTokIcon className="h-3.5 w-3.5" /> TikTok
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="https://tiktok.com/@tu-usuario"
                                            value={settings.tiktokUrl || ""}
                                            onChange={(e) => setSettings({ ...settings, tiktokUrl: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[13px] text-white focus:outline-none focus:border-primary transition-colors"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[11px] text-white/60 font-medium uppercase tracking-widest flex items-center gap-2 text-primary">
                                            <Plus className="h-3.5 w-3.5" /> WhatsApp (Número completo)
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Ej: 5493411234567"
                                            value={settings.whatsappNumber || ""}
                                            onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                                            className="w-full bg-white/5 border border-primary/20 rounded-xl px-4 py-3 text-[13px] text-white focus:outline-none focus:border-primary transition-colors"
                                        />
                                        <p className="text-[10px] text-white/30 italic">Sin espacios, sin el +, incluyendo código de país y área.</p>
                                    </div>
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

                {/* TAB: EMAIL MARKETING */}
                {activeTab === "email-marketing" && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl">
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-primary/5 border border-primary/20 rounded-3xl p-6 flex items-center gap-6">
                                <div className="h-14 w-14 rounded-2xl bg-primary/20 flex items-center justify-center">
                                    <Users className="h-7 w-7 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-white text-lg font-medium tracking-tight">Audiencia Alcanzada</h2>
                                    <p className="text-2xl font-bold text-primary">
                                        {emailForm.audience === 'CUSTOM_LIST'
                                            ? ((emailForm as any).customEmails || []).length
                                            : (audienceStats[emailForm.audience] || 0)}
                                        <span className="text-[10px] text-white/40 uppercase font-light tracking-widest ml-2">
                                            {emailForm.audience === 'ALL' && 'Total de Reach'}
                                            {emailForm.audience === 'ABANDONED_CART' && 'Carritos Abandonados'}
                                            {emailForm.audience === 'CUSTOMERS' && 'Clientes que Compraron'}
                                            {emailForm.audience === 'REGISTERED' && 'Usuarios Registrados'}
                                            {emailForm.audience === 'CUSTOM_LIST' && 'Correos Manuales'}
                                        </span>
                                    </p>
                                </div>
                            </div>

                            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 space-y-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <Mail className="h-5 w-5 text-primary" />
                                    <h2 className="text-white font-medium tracking-tight">Redactar Nueva Campaña</h2>
                                </div>

                                <form onSubmit={handleSendEmail} className="space-y-6">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1">Seleccionar Audiencia</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {[
                                                { id: 'ALL', label: 'Todos', info: 'Susc. + Clientes' },
                                                { id: 'ABANDONED_CART', label: 'Carritos Abr.', info: 'Emails capturados' },
                                                { id: 'CUSTOMERS', label: 'Compradores', info: 'Tienen pedidos' },
                                                { id: 'REGISTERED', label: 'Registrados', info: 'Todos los usuarios' },
                                                { id: 'CUSTOM_LIST', label: 'Lista Manual', info: 'Pegar correos' }
                                            ].map((group) => (
                                                <button
                                                    key={group.id}
                                                    type="button"
                                                    onClick={() => setEmailForm({ ...emailForm, audience: group.id })}
                                                    className={`p-3 rounded-xl border text-left transition-all ${emailForm.audience === group.id
                                                        ? 'bg-primary/20 border-primary text-primary'
                                                        : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'}`}
                                                >
                                                    <p className="text-[12px] font-bold">{group.label}</p>
                                                    <p className="text-[9px] uppercase tracking-wider opacity-60">
                                                        {group.id === 'CUSTOM_LIST'
                                                            ? 'Ingresa los mails'
                                                            : `${group.info} (${audienceStats[group.id] || 0})`}
                                                    </p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {emailForm.audience === 'CUSTOM_LIST' && (
                                        <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1">Correos (uno por línea o separados por coma)</label>
                                            <textarea
                                                value={(emailForm as any).customEmailsRaw || ""}
                                                onChange={(e) => {
                                                    const raw = e.target.value;
                                                    const emails = raw.split(/[\n,]+/).map(em => em.trim()).filter(em => em.includes("@"));
                                                    setEmailForm({
                                                        ...emailForm,
                                                        ...({ customEmailsRaw: raw, customEmails: emails } as any)
                                                    });
                                                }}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[13px] text-white focus:outline-none focus:border-primary transition-colors min-h-[100px] font-mono"
                                                placeholder="mate@tienda.com&#10;yerba@tienda.com"
                                            />
                                            <p className="text-[10px] text-primary mt-1">
                                                Detectados: {((emailForm as any).customEmails || []).length} correos válidos.
                                            </p>
                                        </div>
                                    )}

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1">Asunto del Correo</label>
                                        <input
                                            type="text"
                                            value={emailForm.subject}
                                            onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[14px] text-white focus:outline-none focus:border-primary transition-colors"
                                            placeholder="Ej: ¡Nuevos ingresos de mates premium! 🧉"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1">Cuerpo del Mensaje</label>
                                        <textarea
                                            value={emailForm.content}
                                            onChange={(e) => setEmailForm({ ...emailForm, content: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[14px] text-white focus:outline-none focus:border-primary transition-colors min-h-[200px] resize-none"
                                            placeholder="Escribí el contenido de tu correo aquí..."
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1">Texto del Botón (Opcional)</label>
                                            <input
                                                type="text"
                                                value={emailForm.buttonText}
                                                onChange={(e) => setEmailForm({ ...emailForm, buttonText: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[13px] text-white focus:outline-none focus:border-primary transition-colors"
                                                placeholder="Ver Tienda"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1">URL del Botón (Opcional)</label>
                                            <input
                                                type="text"
                                                value={emailForm.buttonUrl}
                                                onChange={(e) => setEmailForm({ ...emailForm, buttonUrl: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[13px] text-white focus:outline-none focus:border-primary transition-colors"
                                                placeholder="https://arai-yerba.com/tienda"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSendingEmail || (emailForm.audience === 'CUSTOM_LIST' ? ((emailForm as any).customEmails || []).length === 0 : (audienceStats[emailForm.audience] || 0) === 0)}
                                        className="w-full bg-primary hover:bg-primary-dark disabled:bg-white/5 disabled:text-white/20 text-white py-4 rounded-xl text-[13px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl shadow-primary/10 hover:-translate-y-0.5"
                                    >
                                        {isSendingEmail ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                                        {isSendingEmail ? 'Enviando...' : `Preparar Campaña para ${emailForm.audience === 'CUSTOM_LIST' ? ((emailForm as any).customEmails || []).length : (audienceStats[emailForm.audience] || 0)} personas`}
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Vista Previa Simplificada */}
                        <div className="hidden lg:block space-y-4 animate-in fade-in slide-in-from-right-4 duration-700">
                            <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1">Vista Previa (Sugerida)</label>
                            <div className="bg-white rounded-3xl overflow-hidden shadow-2xl shadow-black/20 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="bg-[#1a432e] py-8 flex flex-col items-center justify-center">
                                    <img
                                        src="/arai_logo.png"
                                        alt="Araí"
                                        className="h-12 w-auto"
                                    />
                                </div>
                                <div className="p-10 space-y-8 min-h-[400px]">
                                    <div className="space-y-4">
                                        <h3 className="text-[#1a1a1a] text-3xl font-bold text-center leading-tight">
                                            {emailForm.subject || "Tu Asunto Aquí"}
                                        </h3>
                                        <div className="w-12 h-1 bg-primary/20 mx-auto rounded-full" />
                                    </div>
                                    <div className="text-[#444444] text-[15px] leading-relaxed whitespace-pre-wrap text-center">
                                        {emailForm.content || "Escribí algo arriba para verlo reflejado acá..."}
                                    </div>

                                    {emailForm.buttonText && (
                                        <div className="flex justify-center pt-4">
                                            <div className="bg-[#0c120e] text-white px-8 py-4 rounded-xl text-[13px] font-bold uppercase tracking-widest shadow-lg">
                                                {emailForm.buttonText}
                                            </div>
                                        </div>
                                    )}

                                    <div className="pt-12 border-t border-gray-100 mt-auto">
                                        <p className="text-[#aaaaaa] text-[10px] text-center uppercase tracking-[0.2em]">
                                            Araí Yerba Mate · {new Date().getFullYear()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Historial de Campañas */}
                        <div className="lg:col-span-2 space-y-6 mt-12">
                            <div className="flex items-center gap-3">
                                <Mail className="h-5 w-5 text-primary" />
                                <h2 className="text-white font-medium tracking-tight">Historial de Campañas</h2>
                            </div>

                            {isLoadingCampaigns ? (
                                <div className="flex items-center justify-center p-12 bg-white/[0.02] border border-white/5 rounded-3xl">
                                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                                </div>
                            ) : campaigns.length === 0 ? (
                                <div className="p-12 text-center bg-white/[0.02] border border-white/5 rounded-3xl">
                                    <p className="text-white/40 text-[13px] italic">Todavía no enviaste ninguna campaña masiva.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {campaigns.map((camp) => (
                                        <div key={camp.id} className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 space-y-4 hover:border-white/10 transition-colors">
                                            <div className="flex justify-between items-start">
                                                <div className="px-2 py-1 rounded bg-primary/10 text-primary text-[9px] font-bold uppercase tracking-widest">
                                                    {camp.audience === 'ALL' && 'Todos'}
                                                    {camp.audience === 'ABANDONED_CART' && 'Carritos Abr.'}
                                                    {camp.audience === 'CUSTOMERS' && 'Compradores'}
                                                    {camp.audience === 'REGISTERED' && 'Registrados'}
                                                    {camp.audience === 'CUSTOM_LIST' && 'Lista Manual'}
                                                </div>
                                                <span className="text-white/20 text-[10px] font-mono">
                                                    {new Date(camp.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div>
                                                <h3 className="text-white text-[14px] font-medium line-clamp-1">{camp.subject}</h3>
                                                <p className="text-white/40 text-[11px] line-clamp-2 mt-1">{camp.content}</p>
                                            </div>
                                            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Users className="h-3.5 w-3.5 text-white/40" />
                                                    <span className="text-white/60 text-[11px] font-bold">{camp.sentCount} <span className="text-[9px] font-light">destinatarios</span></span>
                                                </div>
                                                <button 
                                                    onClick={() => setEmailForm({
                                                        subject: camp.subject,
                                                        content: camp.content,
                                                        buttonText: "",
                                                        buttonUrl: "",
                                                        audience: camp.audience
                                                    })}
                                                    className="text-[10px] text-primary hover:underline font-bold uppercase tracking-tight"
                                                >
                                                    Reutilizar
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === "points" && (
                    <div className="space-y-12">
                        {/* Configuración del Sistema */}
                        <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 max-w-2xl">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                        <Coins className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <h2 className="text-white font-medium tracking-tight">Configuración del Programa</h2>
                                        <p className="text-[11px] text-white/40 uppercase tracking-widest">Estado y ratio de puntos</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleSaveSettings({ preventDefault: () => { } } as any).then(() => {
                                        setSettings(prev => ({ ...prev, pointsEnabled: !prev.pointsEnabled }));
                                        // Update in DB too
                                        fetch("/api/settings", {
                                            method: "POST",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({ ...settings, pointsEnabled: !settings.pointsEnabled })
                                        }).then(() => fetchSettings());
                                    })}
                                    className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${settings.pointsEnabled ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-white/5 text-white/40 border border-white/10'}`}
                                >
                                    {settings.pointsEnabled ? 'Sistema Activo' : 'Sistema Inactivo'}
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[12px] text-white/60 font-medium mb-1 block">Ratio de puntos (Puntos por cada $1)</label>
                                        <p className="text-[11px] text-white/30 mb-3">Ejemplo: 0.01 significa que el cliente recibe 1 punto por cada $100 gastados.</p>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                step="0.001"
                                                value={settings.pointsRatio}
                                                onChange={(e) => setSettings({ ...settings, pointsRatio: Number(e.target.value) })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-[14px] text-white focus:outline-none focus:border-primary transition-colors font-mono"
                                            />
                                        </div>
                                    </div>

                                    {settings.pointsRatio > 0 && (
                                        <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <p className="text-[12px] text-primary/90 flex items-center gap-2">
                                                <Sparkles className="h-3.5 w-3.5" />
                                                <span>
                                                    Por cada <span className="font-bold">$1.000</span> gastados, el cliente recibirá <span className="font-bold underline decoration-2">{(1000 * settings.pointsRatio).toFixed(2).replace(/\.?0+$/, "")} puntos</span>.
                                                </span>
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={handleSaveSettings}
                                    disabled={isSavingSettings}
                                    className="w-full py-4 bg-primary text-white rounded-xl text-[12px] font-bold uppercase tracking-widest transition-all hover:bg-primary-dark shadow-lg shadow-primary/10 flex items-center justify-center gap-3"
                                >
                                    {isSavingSettings ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    Guardar Configuración de Puntos
                                </button>
                            </div>
                        </div>

                        {/* Gestión de Recompensas */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-1">
                                <form onSubmit={handleSaveReward} className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 space-y-4">
                                    <h2 className="text-[14px] text-white font-medium mb-4 flex items-center gap-2">
                                        <Gift className="h-4 w-4 text-primary" /> {rewardForm.id ? 'Editar Recompensa' : 'Nueva Recompensa'}
                                    </h2>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1">Título (Ej: Cupón $1000 OFF)</label>
                                        <input
                                            type="text"
                                            value={rewardForm.title}
                                            onChange={(e) => setRewardForm({ ...rewardForm, title: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[13px] text-white focus:outline-none focus:border-primary transition-colors"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1">Puntos Requeridos</label>
                                        <input
                                            type="number"
                                            value={rewardForm.pointsRequired}
                                            onChange={(e) => setRewardForm({ ...rewardForm, pointsRequired: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[13px] text-white focus:outline-none focus:border-primary transition-colors"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1">Tipo Descuento</label>
                                            <select
                                                value={rewardForm.discountType}
                                                onChange={(e) => setRewardForm({ ...rewardForm, discountType: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[13px] text-white focus:outline-none focus:border-primary transition-colors appearance-none"
                                            >
                                                <option value="FIXED">Monto Fijo ($)</option>
                                                <option value="PERCENTAGE">Porcentaje (%)</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1">Valor</label>
                                            <input
                                                type="number"
                                                value={rewardForm.discountValue}
                                                onChange={(e) => setRewardForm({ ...rewardForm, discountValue: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[13px] text-white focus:outline-none focus:border-primary transition-colors"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-2 mt-4">
                                        <button
                                            type="submit"
                                            disabled={isSavingReward}
                                            className="flex-1 bg-primary hover:bg-primary-dark text-white py-3 rounded-xl text-[12px] font-medium transition-all flex items-center justify-center gap-2"
                                        >
                                            {isSavingReward ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                            {rewardForm.id ? 'Actualizar' : 'Crear'}
                                        </button>
                                        {rewardForm.id && (
                                            <button
                                                type="button"
                                                onClick={() => setRewardForm({ id: "", title: "", pointsRequired: "", discountValue: "", discountType: "FIXED", isActive: true })}
                                                className="px-4 bg-white/5 hover:bg-white/10 text-white/60 rounded-xl text-[12px] transition-all"
                                            >
                                                Cancelar
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </div>

                            <div className="lg:col-span-2">
                                <div className="bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-white/5 bg-white/[0.02]">
                                                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-medium">Recompensa</th>
                                                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-medium text-center">Puntos</th>
                                                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-medium">Beneficio</th>
                                                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-medium text-right">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {isLoadingRewards ? (
                                                <tr>
                                                    <td colSpan={4} className="px-6 py-12 text-center text-white/20 text-[11px] uppercase tracking-widest">Cargando recompensas...</td>
                                                </tr>
                                            ) : rewards.length === 0 ? (
                                                <tr>
                                                    <td colSpan={4} className="px-6 py-12 text-center text-white/20 text-[11px] uppercase tracking-widest">No hay recompensas creadas.</td>
                                                </tr>
                                            ) : rewards.map((r) => (
                                                <tr key={r.id} className="hover:bg-white/[0.02] transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <p className="text-[13px] font-medium text-white">{r.title}</p>
                                                        {!r.isActive && <span className="text-[9px] text-red-400 uppercase font-bold tracking-widest">Inactiva</span>}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="text-[13px] font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">{r.pointsRequired} pts</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-[13px] text-white/60">
                                                        {r.discountType === 'FIXED' ? `$${r.discountValue}` : `${r.discountValue}%`} OFF
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center justify-end gap-3 transition-opacity">
                                                            {confirmDeleteId === r.id ? (
                                                                <div className="flex items-center gap-2">
                                                                    <button onClick={() => handleDeleteReward(r.id)} className="text-[10px] bg-red-500 text-white px-2 py-1 rounded">Borrar</button>
                                                                    <button onClick={() => setConfirmDeleteId(null)} className="text-[10px] text-white/40">No</button>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <button onClick={() => setRewardForm({ ...r, pointsRequired: r.pointsRequired.toString(), discountValue: r.discountValue.toString() })} className="text-white/40 hover:text-white"><Edit2 className="h-4 w-4" /></button>
                                                                    <button onClick={() => setConfirmDeleteId(r.id)} className="text-red-400/60 hover:text-red-400"><Trash2 className="h-4 w-4" /></button>
                                                                </>
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

                {/* TAB 2: COUPONS */}
                {activeTab === "coupons" && (
                    <div className="space-y-12">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Formulario */}
                            <div className="lg:col-span-1 space-y-6">
                                <form onSubmit={handleCreateCoupon} className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 space-y-4">
                                    <h2 className="text-[14px] text-white font-medium mb-4 flex items-center gap-2">
                                        <Tag className="h-4 w-4 text-primary" /> Crear Cupón de Campaña
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
                                        className="w-full bg-primary hover:bg-primary-dark text-white py-3 rounded-xl text-[12px] font-medium transition-all flex items-center justify-center gap-2 mt-4 shadow-lg shadow-primary/10"
                                    >
                                        {isSubmittingCoupon ? <Plus className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                                        Crear Cupón de Campaña
                                    </button>

                                    <div className="bg-primary/5 border border-primary/10 p-4 rounded-2xl">
                                        <p className="text-[11px] text-primary/70 italic flex items-center gap-2">
                                            <Sparkles className="h-3.5 w-3.5" />
                                            Estos cupones son para tus promociones manuales.
                                        </p>
                                    </div>
                                </form>
                            </div>

                            {/* Listado de Cupones de Administración */}
                            <div className="lg:col-span-2 space-y-4">
                                <div className="flex items-center justify-between px-2">
                                    <div>
                                        <h2 className="text-white font-medium tracking-tight">Cupones de Campaña</h2>
                                        <p className="text-[11px] text-white/40 uppercase tracking-widest">Creados manualmente</p>
                                    </div>
                                    <span className="text-[10px] bg-white/5 border border-white/10 px-3 py-1 rounded-full text-white/40 font-bold uppercase tracking-widest">
                                        {coupons.filter(c => !c.userId).length} Activos
                                    </span>
                                </div>

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
                                                ) : coupons.filter(c => !c.userId).length === 0 ? (
                                                    <tr>
                                                        <td colSpan={4} className="px-6 py-12 text-center text-white/20 text-[11px] uppercase tracking-widest">
                                                            No hay cupones de campaña.
                                                        </td>
                                                    </tr>
                                                ) : coupons.filter(c => !c.userId).map((c) => (
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

                    </div>
                )}

                {/* TAB 3: USER COUPONS (REDEMPTIONS) */}
                {activeTab === "user-coupons" && (
                    <div className="space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
                            <div>
                                <h2 className="text-white font-medium tracking-tight text-lg">Canjes de Usuarios</h2>
                                <p className="text-[11px] text-white/40 uppercase tracking-widest">Cupones generados automáticamente por el sistema de puntos</p>
                            </div>

                            <div className="relative w-full md:w-80">
                                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                                <input
                                    type="text"
                                    placeholder="Buscar por usuario, email o código..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-[13px] text-white focus:outline-none focus:border-primary transition-all placeholder:text-white/20"
                                />
                            </div>
                        </div>

                        <div className="bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-white/5 bg-white/[0.02]">
                                            <th className="px-6 py-5 text-[10px] uppercase tracking-widest text-white/40 font-medium">Socio / Usuario</th>
                                            <th className="px-6 py-5 text-[10px] uppercase tracking-widest text-white/40 font-medium">Código</th>
                                            <th className="px-6 py-5 text-[10px] uppercase tracking-widest text-white/40 font-medium">Beneficio</th>
                                            <th className="px-6 py-5 text-[10px] uppercase tracking-widest text-white/40 font-medium">Fecha</th>
                                            <th className="px-6 py-5 text-[10px] uppercase tracking-widest text-white/40 font-medium">Estado</th>
                                            <th className="px-6 py-5 text-[10px] uppercase tracking-widest text-white/40 font-medium text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {isLoadingCoupons ? (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-12 text-center text-white/20 text-[11px] uppercase tracking-widest">
                                                    Cargando historial de canjes...
                                                </td>
                                            </tr>
                                        ) : coupons.filter(c => {
                                            if (!c.userId) return false;
                                            const query = searchQuery.toLowerCase();
                                            return (
                                                c.user?.name?.toLowerCase().includes(query) ||
                                                c.user?.email?.toLowerCase().includes(query) ||
                                                c.code.toLowerCase().includes(query)
                                            );
                                        }).length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-12 text-center text-white/20 text-[11px] uppercase tracking-widest">
                                                    {searchQuery ? "No se encontraron canjes para tu búsqueda." : "Aún no hay canjes registrados."}
                                                </td>
                                            </tr>
                                        ) : coupons.filter(c => {
                                            if (!c.userId) return false;
                                            const query = searchQuery.toLowerCase();
                                            return (
                                                c.user?.name?.toLowerCase().includes(query) ||
                                                c.user?.email?.toLowerCase().includes(query) ||
                                                c.code.toLowerCase().includes(query)
                                            );
                                        }).map((c) => (
                                            <tr key={c.id} className="hover:bg-white/[0.04] transition-all group">
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-[13px] font-medium text-white">{c.user?.name || "Usuario Desconocido"}</span>
                                                        <span className="text-[11px] text-white/40">{c.user?.email || "Sin email"}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <code className="text-[12px] font-bold text-primary font-mono bg-primary/10 px-2 py-1 rounded border border-primary/20">
                                                        {c.code}
                                                    </code>
                                                </td>
                                                <td className="px-6 py-4 text-[13px] text-white">
                                                    {c.discountType === 'PERCENTAGE' ? `${c.discountValue}% OFF` : `$${c.discountValue.toLocaleString('es-AR')} OFF`}
                                                </td>
                                                <td className="px-6 py-4 text-[11px] text-white/40">
                                                    {new Date(c.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${c.isActive
                                                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                                        : 'bg-red-500/10 text-red-400 border border-red-500/20 opacity-50'
                                                        }`}>
                                                        {c.isActive ? 'Disponible' : 'Utilizado'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {confirmDeleteId === c.id ? (
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button onClick={() => confirmDeleteCoupon(c.id)} className="text-[9px] bg-red-500 text-white px-2 py-1 rounded font-bold uppercase">Borrar</button>
                                                            <button onClick={() => setConfirmDeleteId(null)} className="text-[9px] text-white/40 uppercase">No</button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => setConfirmDeleteId(c.id)}
                                                            className="text-white/20 hover:text-red-400 transition-colors"
                                                            title="Eliminar canje"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
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

            {/* CUSTOM CONFIRMATION MODAL */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-[#0c120e] border border-white/10 rounded-[32px] p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-300 space-y-6">
                        <div className="h-16 w-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-2">
                            <Send className="h-8 w-8 text-primary" />
                        </div>
                        <div className="text-center space-y-2">
                            <h3 className="text-xl font-medium text-white tracking-tight">¿Lanzamos la campaña?</h3>
                            <p className="text-white/40 text-[13px] leading-relaxed">
                                Estás por enviar este correo a <span className="text-primary font-bold">
                                    {emailForm.audience === 'CUSTOM_LIST' 
                                        ? ((emailForm as any).customEmails || []).length 
                                        : (audienceStats[emailForm.audience] || 0)} personas
                                </span>. Esta acción no se puede deshacer.
                            </p>
                        </div>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={confirmAndSendEmail}
                                className="w-full bg-primary hover:bg-primary-dark text-white py-4 rounded-2xl text-[13px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-primary/10"
                            >
                                Sí, enviar ahora 🚀
                            </button>
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="w-full bg-white/5 hover:bg-white/10 text-white/40 py-4 rounded-2xl text-[13px] font-bold uppercase tracking-widest transition-all"
                            >
                                No, revisar de nuevo
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
