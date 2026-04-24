"use client";

import {
    Plus,
    Layers,
    Edit2,
    Trash2,
    Image as ImageIcon,
    ChevronRight,
    Loader2
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useAdminUtils } from "@/components/admin/AdminUtilsProvider";

export default function CategoriasPage() {
    const { confirm, showToast } = useAdminUtils();
    const [categorias, setCategorias] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        description: "",
        image: "",
        parentId: ""
    });

    const fetchCategorias = async () => {
        try {
            const res = await fetch("/api/categories");
            const data = await res.json();
            if (Array.isArray(data)) setCategorias(data);
        } catch (error) {
            console.error("Error fetching categories:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchCategorias(); }, []);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploading(true);
        const fd = new FormData();
        fd.append("file", file);
        try {
            const res = await fetch("/api/upload", { method: "POST", body: fd });
            const data = await res.json();
            if (data.url) setFormData(prev => ({ ...prev, image: data.url }));
            else showToast(data.error || "Error al subir la imagen", "error");
        } catch {
            showToast("Error de conexión al subir el archivo", "error");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.slug) return;
        setIsSubmitting(true);
        try {
            const method = editingId ? "PUT" : "POST";
            const payload = editingId ? { ...formData, id: editingId } : formData;
            const res = await fetch("/api/categories", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                showToast(editingId ? "Categoría actualizada" : "Categoría creada");
                setFormData({ name: "", slug: "", description: "", image: "", parentId: "" });
                setEditingId(null);
                fetchCategorias();
            } else {
                const err = await res.json();
                showToast(err.error || "Error al guardar categoría", "error");
            }
        } catch {
            showToast("Ocurrió un error inesperado", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (cat: any) => {
        setEditingId(cat.id);
        setFormData({
            name: cat.name,
            slug: cat.slug,
            description: cat.description || "",
            image: cat.image || "",
            parentId: cat.parentId || ""
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setFormData({ name: "", slug: "", description: "", image: "", parentId: "" });
    };

    const handleDelete = async (id: string, slug: string) => {
        if (slug === "sin-categoria") {
            showToast("No se puede eliminar la categoría por defecto", "warning");
            return;
        }
        const ok = await confirm({
            title: "¿Eliminar categoría?",
            message: "¿Estás seguro? Las subcategorías quedarán sin categoría padre y los productos pasarán a 'Sin Categoría'.",
            confirmText: "Eliminar",
            type: "danger"
        });
        if (!ok) return;
        try {
            const res = await fetch(`/api/categories?id=${id}`, { method: "DELETE" });
            if (res.ok) {
                showToast("Categoría eliminada");
                fetchCategorias();
            } else {
                const err = await res.json();
                showToast(err.error || "Error al eliminar categoría", "error");
            }
        } catch {
            showToast("Error de conexión al eliminar", "error");
        }
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        const slug = name.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
        setFormData({ ...formData, name, slug: editingId ? formData.slug : slug });
    };

    // Only top-level categories can be parents (1 level deep)
    const parentOptions = categorias.filter(c => !c.parentId && c.id !== editingId);

    // Build hierarchical display for table
    const topLevel = categorias.filter(c => !c.parentId);
    const tableRows: Array<any & { _isChild?: boolean }> = [];
    for (const parent of topLevel) {
        tableRows.push(parent);
        const children = categorias.filter(c => c.parentId === parent.id);
        for (const child of children) {
            tableRows.push({ ...child, _isChild: true });
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-light text-white font-montserrat tracking-tight">categorías</h1>
                    <p className="text-white/40 text-[11px] uppercase tracking-widest">organiza tus productos por grupos</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form */}
                <div className="lg:col-span-1 space-y-6">
                    <form onSubmit={handleSubmit} className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 space-y-4">
                        <h2 className="text-[14px] text-white font-medium mb-4">
                            {editingId ? "Editar categoría" : "Añadir nueva categoría"}
                        </h2>

                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1">Nombre</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={handleNameChange}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[13px] text-white focus:outline-none focus:border-primary transition-colors"
                                placeholder="Ej: Yerba Mate"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1">Slug</label>
                            <input
                                type="text"
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[13px] text-white focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
                                placeholder="ej-yerba-mate"
                                required
                                disabled={formData.slug === "sin-categoria" && editingId !== null}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1">Categoría padre</label>
                            <select
                                value={formData.parentId}
                                onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[13px] text-white focus:outline-none focus:border-primary transition-colors"
                            >
                                <option value="" className="bg-gray-900">Ninguna (categoría raíz)</option>
                                {parentOptions.map(cat => (
                                    <option key={cat.id} value={cat.id} className="bg-gray-900">{cat.name}</option>
                                ))}
                            </select>
                            <p className="text-[9px] text-white/20 ml-1 italic">Opcional. Solo un nivel de jerarquía.</p>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1">Descripción</label>
                            <textarea
                                rows={3}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[13px] text-white focus:outline-none focus:border-primary transition-colors resize-none"
                                placeholder="Breve descripción de la categoría..."
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1">Imagen de categoría</label>
                            <div className="space-y-3">
                                {formData.image ? (
                                    <div className="relative w-full h-32 rounded-xl overflow-hidden border border-white/10">
                                        <Image src={formData.image} alt="Preview" fill className="object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, image: "" })}
                                            className="absolute top-2 right-2 bg-black/50 p-1.5 rounded-full hover:bg-black/70 transition-colors"
                                        >
                                            <ImageIcon className="h-3.5 w-3.5 text-white" />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="border-2 border-dashed border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-white/[0.02] transition-all group">
                                        <div className="bg-white/5 p-3 rounded-full mb-3 group-hover:scale-110 transition-transform">
                                            {isUploading ? <Loader2 className="h-5 w-5 text-white/40 animate-spin" /> : <ImageIcon className="h-5 w-5 text-white/40" />}
                                        </div>
                                        <p className="text-[10px] text-white/40 text-center">{isUploading ? "Subiendo..." : "Seleccionar imagen"}</p>
                                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} ref={fileInputRef} />
                                    </label>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 pt-2">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-primary hover:bg-primary-dark text-white py-3 rounded-xl text-[12px] font-medium transition-all flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : (!editingId && <Plus className="h-4 w-4" />)}
                                {isSubmitting ? "Procesando..." : (editingId ? "Actualizar categoría" : "Añadir nueva categoría")}
                            </button>
                            {editingId && (
                                <button
                                    type="button"
                                    onClick={handleCancelEdit}
                                    className="w-full bg-white/5 hover:bg-white/10 text-white/60 py-3 rounded-xl text-[12px] font-medium transition-all"
                                >
                                    Cancelar edición
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Table */}
                <div className="lg:col-span-2">
                    <div className="bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/5 bg-white/[0.02]">
                                        <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-medium">Imagen</th>
                                        <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-medium">Nombre</th>
                                        <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-medium">Slug</th>
                                        <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-medium text-right">Productos</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-white/20 text-[11px] uppercase tracking-widest">
                                                Cargando categorías...
                                            </td>
                                        </tr>
                                    ) : tableRows.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-white/20 text-[11px] uppercase tracking-widest">
                                                No hay categorías creadas.
                                            </td>
                                        </tr>
                                    ) : tableRows.map((cat) => (
                                        <tr key={cat.id} className={`hover:bg-white/[0.02] transition-colors group ${cat._isChild ? "bg-white/[0.01]" : ""}`}>
                                            <td className="px-6 py-4">
                                                <div className={`${cat._isChild ? "ml-5" : ""} w-10 h-10 bg-white/5 rounded-lg border border-white/10 overflow-hidden relative flex-shrink-0`}>
                                                    {cat.image ? (
                                                        <Image src={cat.image} alt={cat.name} fill className="object-cover" />
                                                    ) : (
                                                        <ImageIcon className="h-4 w-4 text-white/20 absolute inset-0 m-auto" />
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className={`flex flex-col gap-1 ${cat._isChild ? "ml-5" : ""}`}>
                                                    <div className="flex items-center gap-2">
                                                        {cat._isChild && <ChevronRight className="h-3 w-3 text-white/20 flex-shrink-0" />}
                                                        <span className="text-[13px] font-medium text-white/90">{cat.name}</span>
                                                        {!cat._isChild && cat.children?.length > 0 && (
                                                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary/60">{cat.children.length} sub</span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => handleEdit(cat)}
                                                            className="text-[10px] text-white/40 hover:text-white flex items-center gap-1"
                                                        >
                                                            <Edit2 className="h-3 w-3" /> Editar
                                                        </button>
                                                        {cat.slug !== "sin-categoria" && (
                                                            <button
                                                                onClick={() => handleDelete(cat.id, cat.slug)}
                                                                className="text-[10px] text-red-400/60 hover:text-red-400 flex items-center gap-1"
                                                            >
                                                                <Trash2 className="h-3 w-3" /> Borrar
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-[12px] text-white/60 font-mono tracking-tight">{cat.slug}</td>
                                            <td className="px-6 py-4 text-right text-[12px] text-white/60">{cat._count?.products || 0}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
