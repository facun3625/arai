"use client";

import { useState, useEffect } from "react";
import { Gift, Search, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";
import { useAdminUtils } from "@/components/admin/AdminUtilsProvider";

interface Category {
    id: string;
    name: string;
    slug: string;
}

interface CategoryPromotion {
    id: string;
    categoryId: string;
    isActive: boolean;
    category: Category;
}

export default function PromocionesCategoriaPage() {
    const { confirm, showToast } = useAdminUtils();
    const [categories, setCategories] = useState<Category[]>([]);
    const [promotions, setPromotions] = useState<CategoryPromotion[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategoryId, setSelectedCategoryId] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const fetchData = async () => {
        try {
            const [catRes, promoRes] = await Promise.all([
                fetch("/api/categories"),
                fetch("/api/promotions/category")
            ]);
            const catData = await catRes.json();
            const promoData = await promoRes.json();

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
            if (Array.isArray(promoData)) setPromotions(promoData);
        } catch {
            showToast("Error al cargar promociones", "error");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const availableCategories = categories.filter(c => !promotions.some(p => p.categoryId === c.id));

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCategoryId) return;
        setIsSaving(true);
        try {
            const res = await fetch("/api/promotions/category", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ categoryId: selectedCategoryId, isActive: true })
            });
            if (res.ok) {
                showToast("Promoción activada");
                setSelectedCategoryId("");
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

    const toggleActive = async (promo: CategoryPromotion) => {
        try {
            const res = await fetch("/api/promotions/category", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ categoryId: promo.categoryId, isActive: !promo.isActive })
            });
            if (res.ok) fetchData();
        } catch {
            showToast("Error al actualizar", "error");
        }
    };

    const handleDelete = async (promo: CategoryPromotion) => {
        const ok = await confirm({
            title: "¿Eliminar promoción?",
            message: `Se eliminará el 2x1 para "${promo.category.name}".`,
            confirmText: "Eliminar",
            type: "danger"
        });
        if (!ok) return;
        try {
            const res = await fetch(`/api/promotions/category?id=${promo.id}`, { method: "DELETE" });
            if (res.ok) {
                setPromotions(promotions.filter(p => p.id !== promo.id));
                showToast("Promoción eliminada");
            }
        } catch {
            showToast("Error al eliminar", "error");
        }
    };

    const filtered = promotions.filter(p => p.category.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-light text-white font-montserrat tracking-tight">promociones por categoría</h1>
                <p className="text-white/40 text-[11px] uppercase tracking-widest">2x1 automático: al elegir varios productos de la misma categoría, se paga la mitad más cara y el resto sale gratis de a pares</p>
            </div>

            {/* Formulario */}
            <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-6">
                <h2 className="text-white/60 text-[11px] uppercase tracking-widest font-bold mb-5">Activar en una categoría</h2>
                <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-end">
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
                    <button
                        type="submit"
                        disabled={isSaving || !selectedCategoryId}
                        className="bg-primary hover:bg-primary/90 disabled:opacity-40 text-white px-5 py-3 rounded-xl text-[12px] font-medium flex items-center justify-center gap-2 transition-all"
                    >
                        <Gift className="h-4 w-4" />
                        Activar 2x1
                    </button>
                </form>
                {availableCategories.length === 0 && !isLoading && (
                    <p className="text-[11px] text-white/30 mt-3">Todas las categorías ya tienen una promoción configurada.</p>
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
                            <th className="px-6 py-4 text-[10px] font-medium text-white/40 uppercase tracking-widest">Regla</th>
                            <th className="px-6 py-4 text-[10px] font-medium text-white/40 uppercase tracking-widest">Estado</th>
                            <th className="px-6 py-4 text-[10px] font-medium text-white/40 uppercase tracking-widest text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={4} className="px-6 py-12 text-center text-white/20 text-[11px] uppercase tracking-widest animate-pulse">Cargando...</td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan={4} className="px-6 py-12 text-center text-white/20 text-[11px] uppercase tracking-widest">No hay promociones configuradas</td></tr>
                        ) : filtered.map(p => (
                            <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <Gift className="h-3.5 w-3.5 text-white/30" />
                                        <span className="text-[13px] text-white font-medium font-montserrat">{p.category.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-[12px] text-primary font-bold">2x1 (el más barato de cada par, gratis)</span>
                                </td>
                                <td className="px-6 py-4">
                                    <button onClick={() => toggleActive(p)} className="flex items-center gap-2 text-[11px] font-medium transition-colors">
                                        {p.isActive
                                            ? <><ToggleRight className="h-5 w-5 text-primary" /><span className="text-primary">Activo</span></>
                                            : <><ToggleLeft className="h-5 w-5 text-white/20" /><span className="text-white/30">Inactivo</span></>
                                        }
                                    </button>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => handleDelete(p)}
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
