"use client";

import { useState, useEffect } from "react";
import { MapPin, Plus, Trash2, Search, Percent, DollarSign, ToggleLeft, ToggleRight } from "lucide-react";
import { useAdminUtils } from "@/components/admin/AdminUtilsProvider";

interface ZipDiscount {
    id: string;
    zipCode: string;
    discountType: "PERCENTAGE" | "FIXED";
    discountValue: number;
    label?: string;
    isActive: boolean;
}

export default function DescuentosCpPage() {
    const { confirm, showToast } = useAdminUtils();
    const [discounts, setDiscounts] = useState<ZipDiscount[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const [newZip, setNewZip] = useState("");
    const [newType, setNewType] = useState<"PERCENTAGE" | "FIXED">("PERCENTAGE");
    const [newValue, setNewValue] = useState("");
    const [newLabel, setNewLabel] = useState("");

    const fetchDiscounts = async () => {
        try {
            const res = await fetch("/api/settings/zip-discounts");
            const data = await res.json();
            if (Array.isArray(data)) setDiscounts(data);
        } catch {
            showToast("Error al cargar descuentos", "error");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchDiscounts(); }, []);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newZip || !newValue) return;
        setIsSaving(true);
        try {
            const res = await fetch("/api/settings/zip-discounts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ zipCode: newZip, discountType: newType, discountValue: Number(newValue), label: newLabel })
            });
            if (res.ok) {
                showToast("Descuento guardado");
                setNewZip(""); setNewValue(""); setNewLabel("");
                fetchDiscounts();
            } else {
                const err = await res.json();
                showToast(err.error || "Error al guardar", "error");
            }
        } catch {
            showToast("Error de conexión", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const toggleActive = async (discount: ZipDiscount) => {
        try {
            const res = await fetch("/api/settings/zip-discounts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...discount, isActive: !discount.isActive })
            });
            if (res.ok) fetchDiscounts();
        } catch {
            showToast("Error al actualizar", "error");
        }
    };

    const handleDelete = async (id: string) => {
        const ok = await confirm({
            title: "¿Eliminar descuento?",
            message: "Se eliminará este descuento por código postal.",
            confirmText: "Eliminar",
            type: "danger"
        });
        if (!ok) return;
        try {
            const res = await fetch(`/api/settings/zip-discounts?id=${id}`, { method: "DELETE" });
            if (res.ok) {
                setDiscounts(discounts.filter(d => d.id !== id));
                showToast("Descuento eliminado");
            }
        } catch {
            showToast("Error al eliminar", "error");
        }
    };

    const filtered = discounts.filter(d => d.zipCode.includes(searchTerm) || d.label?.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-light text-white font-montserrat tracking-tight">descuentos por código postal</h1>
                <p className="text-white/40 text-[11px] uppercase tracking-widest">asigná descuentos automáticos según el CP del cliente</p>
            </div>

            {/* Formulario */}
            <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-6">
                <h2 className="text-white/60 text-[11px] uppercase tracking-widest font-bold mb-5">Agregar nuevo</h2>
                <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] text-white/40 uppercase tracking-widest">Código Postal</label>
                        <input
                            type="text"
                            placeholder="Ej: 3300"
                            value={newZip}
                            onChange={e => setNewZip(e.target.value)}
                            required
                            className="bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white text-[13px] focus:outline-none focus:border-primary/40 transition-all placeholder:text-white/20"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] text-white/40 uppercase tracking-widest">Tipo</label>
                        <select
                            value={newType}
                            onChange={e => setNewType(e.target.value as "PERCENTAGE" | "FIXED")}
                            className="bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white text-[13px] focus:outline-none focus:border-primary/40 transition-all"
                        >
                            <option value="PERCENTAGE">Porcentaje (%)</option>
                            <option value="FIXED">Monto fijo ($)</option>
                        </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] text-white/40 uppercase tracking-widest">Valor</label>
                        <input
                            type="number"
                            placeholder={newType === "PERCENTAGE" ? "Ej: 10" : "Ej: 5000"}
                            value={newValue}
                            onChange={e => setNewValue(e.target.value)}
                            min="0"
                            required
                            className="bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white text-[13px] focus:outline-none focus:border-primary/40 transition-all placeholder:text-white/20"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] text-white/40 uppercase tracking-widest">Etiqueta (opcional)</label>
                        <input
                            type="text"
                            placeholder="Ej: Zona norte"
                            value={newLabel}
                            onChange={e => setNewLabel(e.target.value)}
                            className="bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white text-[13px] focus:outline-none focus:border-primary/40 transition-all placeholder:text-white/20"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isSaving || !newZip || !newValue}
                        className="bg-primary hover:bg-primary/90 disabled:opacity-40 text-white px-5 py-3 rounded-xl text-[12px] font-medium flex items-center justify-center gap-2 transition-all"
                    >
                        <Plus className="h-4 w-4" />
                        Agregar
                    </button>
                </form>
            </div>

            {/* Buscador */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                <input
                    type="text"
                    placeholder="Buscar por CP o etiqueta..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl pl-11 pr-4 py-3 text-white text-[13px] focus:outline-none focus:border-white/10 placeholder:text-white/20"
                />
            </div>

            {/* Tabla */}
            <div className="bg-white/[0.03] border border-white/5 rounded-3xl overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-white/5">
                            <th className="px-6 py-4 text-[10px] font-medium text-white/40 uppercase tracking-widest">Código Postal</th>
                            <th className="px-6 py-4 text-[10px] font-medium text-white/40 uppercase tracking-widest">Descuento</th>
                            <th className="px-6 py-4 text-[10px] font-medium text-white/40 uppercase tracking-widest">Etiqueta</th>
                            <th className="px-6 py-4 text-[10px] font-medium text-white/40 uppercase tracking-widest">Estado</th>
                            <th className="px-6 py-4 text-[10px] font-medium text-white/40 uppercase tracking-widest text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={5} className="px-6 py-12 text-center text-white/20 text-[11px] uppercase tracking-widest animate-pulse">Cargando...</td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan={5} className="px-6 py-12 text-center text-white/20 text-[11px] uppercase tracking-widest">No hay descuentos configurados</td></tr>
                        ) : filtered.map(d => (
                            <tr key={d.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-3.5 w-3.5 text-white/30" />
                                        <span className="text-[13px] text-white font-medium font-montserrat">{d.zipCode}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="flex items-center gap-1.5 text-[13px] font-bold text-primary">
                                        {d.discountType === "PERCENTAGE"
                                            ? <><Percent className="h-3.5 w-3.5" />{d.discountValue}% OFF</>
                                            : <><DollarSign className="h-3.5 w-3.5" />$ {d.discountValue.toLocaleString("es-AR")} OFF</>
                                        }
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-[12px] text-white/50">{d.label || "-"}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <button onClick={() => toggleActive(d)} className="flex items-center gap-2 text-[11px] font-medium transition-colors">
                                        {d.isActive
                                            ? <><ToggleRight className="h-5 w-5 text-primary" /><span className="text-primary">Activo</span></>
                                            : <><ToggleLeft className="h-5 w-5 text-white/20" /><span className="text-white/30">Inactivo</span></>
                                        }
                                    </button>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => handleDelete(d.id)}
                                        className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/10 rounded-lg text-white/20 hover:text-red-400 transition-all"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
