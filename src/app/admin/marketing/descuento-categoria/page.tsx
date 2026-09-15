"use client";

import { useState, useEffect } from "react";
import { Percent, Search, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";
import { useAdminUtils } from "@/components/admin/AdminUtilsProvider";

interface Category {
    id: string;
    name: string;
    slug: string;
}

interface CategoryDiscount {
    id: string;
    categoryId: string;
    percentage: number;
    isActive: boolean;
    category: Category;
}

export default function DescuentoCategoriaPage() {
    const { confirm, showToast } = useAdminUtils();
    const [categories, setCategories] = useState<Category[]>([]);
    const [discounts, setDiscounts] = useState<CategoryDiscount[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategoryId, setSelectedCategoryId] = useState("");
    const [percentage, setPercentage] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const fetchData = async () => {
        try {
            const [catRes, discRes] = await Promise.all([
                fetch("/api/categories"),
                fetch("/api/promotions/category-percent")
            ]);
            const catData = await catRes.json();
            const discData = await discRes.json();

            const flatCategories: Category[] = [];
            if (Array.isArray(catData)) {
                catData.forEach((c: any) => {
                    flatCategories.push({ id: c.id, name: c.name, slug: c.slug });
                    if (Array.isArray(c.children)) {
                        c.children.forEach((child: any) => flatCategories.push({ id: child.id, name: child.name, slug: child.slug }));
                    }
                });
            }
            setCategories(flatCategories);
            if (Array.isArray(discData)) setDiscounts(discData);
        } catch {
            showToast("Error al cargar descuentos", "error");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const availableCategories = categories.filter(c => !discounts.some(d => d.categoryId === c.id));

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCategoryId || !percentage) return;
        setIsSaving(true);
        try {
            const res = await fetch("/api/promotions/category-percent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ categoryId: selectedCategoryId, percentage: Number(percentage), isActive: true })
            });
            if (res.ok) {
                showToast("Descuento activado");
                setSelectedCategoryId("");
                setPercentage("");
                fetchData();
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

    const toggleActive = async (discount: CategoryDiscount) => {
        try {
            const res = await fetch("/api/promotions/category-percent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ categoryId: discount.categoryId, percentage: discount.percentage, isActive: !discount.isActive })
            });
            if (res.ok) fetchData();
        } catch {
            showToast("Error al actualizar", "error");
        }
    };

    const handleDelete = async (discount: CategoryDiscount) => {
        const ok = await confirm({
            title: "¿Eliminar descuento?",
            message: `Se eliminará el descuento del ${discount.percentage}% para "${discount.category.name}".`,
            confirmText: "Eliminar",
            type: "danger"
        });
        if (!ok) return;
        try {
            const res = await fetch(`/api/promotions/category-percent?id=${discount.id}`, { method: "DELETE" });
            if (res.ok) {
                setDiscounts(discounts.filter(d => d.id !== discount.id));
                showToast("Descuento eliminado");
            }
        } catch {
            showToast("Error al eliminar", "error");
        }
    };

    const filtered = discounts.filter(d => d.category.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-light text-white font-montserrat tracking-tight">descuento por categoría</h1>
                <p className="text-white/40 text-[11px] uppercase tracking-widest">% automático: se aplica solo en el carrito/checkout sobre todos los productos de la categoría, sin necesidad de cupón</p>
            </div>

            {/* Formulario */}
            <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-6">
                <h2 className="text-white/60 text-[11px] uppercase tracking-widest font-bold mb-5">Activar en una categoría</h2>
                <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-[1fr_140px_auto] gap-3 items-end">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] text-white/40 uppercase tracking-widest">Categoría</label>
                        <select
                            value={selectedCategoryId}
                            onChange={e => setSelectedCategoryId(e.target.value)}
                            required
                            className="bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white text-[13px] focus:outline-none focus:border-primary/40 transition-all"
                        >
                            <option value="">Seleccioná una categoría...</option>
                            {availableCategories.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] text-white/40 uppercase tracking-widest">Porcentaje</label>
                        <input
                            type="number"
                            min={1}
                            max={100}
                            step="0.1"
                            value={percentage}
                            onChange={e => setPercentage(e.target.value)}
                            placeholder="Ej: 20"
                            required
                            className="bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white text-[13px] focus:outline-none focus:border-primary/40 transition-all"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isSaving || !selectedCategoryId || !percentage}
                        className="bg-primary hover:bg-primary/90 disabled:opacity-40 text-white px-5 py-3 rounded-xl text-[12px] font-medium flex items-center justify-center gap-2 transition-all"
                    >
                        <Percent className="h-4 w-4" />
                        Activar
                    </button>
                </form>
                {availableCategories.length === 0 && !isLoading && (
                    <p className="text-[11px] text-white/30 mt-3">Todas las categorías ya tienen un descuento configurado.</p>
                )}
            </div>

            {/* Buscador */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                <input
                    type="text"
                    placeholder="Buscar por categoría..."
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
                            <th className="px-6 py-4 text-[10px] font-medium text-white/40 uppercase tracking-widest">Categoría</th>
                            <th className="px-6 py-4 text-[10px] font-medium text-white/40 uppercase tracking-widest">Descuento</th>
                            <th className="px-6 py-4 text-[10px] font-medium text-white/40 uppercase tracking-widest">Estado</th>
                            <th className="px-6 py-4 text-[10px] font-medium text-white/40 uppercase tracking-widest text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={4} className="px-6 py-12 text-center text-white/20 text-[11px] uppercase tracking-widest animate-pulse">Cargando...</td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan={4} className="px-6 py-12 text-center text-white/20 text-[11px] uppercase tracking-widest">No hay descuentos configurados</td></tr>
                        ) : filtered.map(d => (
                            <tr key={d.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <Percent className="h-3.5 w-3.5 text-white/30" />
                                        <span className="text-[13px] text-white font-medium font-montserrat">{d.category.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-[12px] text-primary font-bold">{d.percentage}% off</span>
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
                                        onClick={() => handleDelete(d)}
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
