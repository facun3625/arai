"use client";

import { AdminLayout } from "@/components/admin/AdminLayout";
import {
    Plus,
    MoreVertical,
    Layers,
    Search,
    Edit2,
    Trash2,
    Image as ImageIcon,
    X,
    Loader2
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";

export default function CategoriasPage() {
    const [categorias, setCategorias] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form states
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        description: "",
        image: ""
    });

    const fetchCategorias = async () => {
        try {
            const res = await fetch("/api/categories");
            const data = await res.json();
            if (Array.isArray(data)) {
                // Ensure "sin-categoria" stays at the top or handle specifically if needed
                setCategorias(data);
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCategorias();
    }, []);

    const handleFileUploadCategory = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formDataUpload = new FormData();
        formDataUpload.append("file", file);

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formDataUpload
            });
            const data = await res.json();
            if (data.url) {
                setFormData(prev => ({ ...prev, image: data.url }));
            } else {
                alert(data.error || "Error al subir la imagen");
            }
        } catch (error) {
            alert("Error de conexión al subir el archivo");
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
            const res = await fetch("/api/categories", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editingId ? { ...formData, id: editingId } : formData)
            });

            if (res.ok) {
                setFormData({ name: "", slug: "", description: "", image: "" });
                setEditingId(null);
                fetchCategorias();
            } else {
                const err = await res.json();
                alert(err.error || `Error al ${editingId ? 'actualizar' : 'crear'} categoría`);
            }
        } catch (error) {
            alert("Ocurrió un error inesperado");
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
            image: cat.image || ""
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setFormData({ name: "", slug: "", description: "", image: "" });
    };

    const handleDelete = async (id: string, slug: string) => {
        if (slug === "sin-categoria") {
            alert("No se puede eliminar la categoría por defecto");
            return;
        }

        if (!confirm("¿Estás seguro de que deseas eliminar esta categoría?")) return;

        try {
            const res = await fetch(`/api/categories?id=${id}`, {
                method: "DELETE"
            });

            if (res.ok) {
                fetchCategorias();
            } else {
                const err = await res.json();
                alert(err.error || "Error al eliminar categoría");
            }
        } catch (error) {
            alert("Error de conexión al eliminar");
        }
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        const slug = name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
        // Only auto-update slug if not editing or if we really want to auto-slug
        setFormData({ ...formData, name, slug: editingId ? formData.slug : slug });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formDataUpload = new FormData();
        formDataUpload.append("file", file);

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formDataUpload
            });
            const data = await res.json();
            if (data.url) {
                setFormData({ ...formData, image: data.url });
            } else {
                alert("Error al subir imagen");
            }
        } catch (error) {
            console.error("Upload error:", error);
            alert("Error de conexión al subir imagen");
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-8 animate-in fade-in duration-700">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl font-light text-white font-montserrat tracking-tight">categorías</h1>
                        <p className="text-white/40 text-[11px] uppercase tracking-widest">organiza tus productos por grupos</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Formulario Lateral (WordPress Style) */}
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
                                <p className="text-[9px] text-white/20 ml-1 italic">El nombre es como aparecerá en tu sitio.</p>
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
                                <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1">Descripción</label>
                                <textarea
                                    rows={4}
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
                                                <ImageIcon className="h-5 w-5 text-white/40" />
                                            </div>
                                            <p className="text-[10px] text-white/40 text-center">Seleccionar imagen</p>
                                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
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
                                    {isSubmitting ? <Plus className="h-4 w-4 animate-spin" /> : (editingId ? null : <Plus className="h-4 w-4" />)}
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

                    {/* Tabla de Categorías */}
                    <div className="lg:col-span-2">
                        <div className="bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-white/5 bg-white/[0.02]">
                                            <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-medium">Imagen</th>
                                            <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-medium">Nombre</th>
                                            <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-medium">Slug</th>
                                            <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-medium text-right">Cantidad</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {isLoading ? (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-12 text-center text-white/20 text-[11px] uppercase tracking-widest">
                                                    Cargando categorías...
                                                </td>
                                            </tr>
                                        ) : categorias.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-12 text-center text-white/20 text-[11px] uppercase tracking-widest">
                                                    No hay categorías creadas.
                                                </td>
                                            </tr>
                                        ) : categorias.map((cat) => (
                                            <tr key={cat.id} className="hover:bg-white/[0.02] transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="w-10 h-10 bg-white/5 rounded-lg border border-white/10 overflow-hidden relative">
                                                        {cat.image ? (
                                                            <Image src={cat.image} alt={cat.name} fill className="object-cover" />
                                                        ) : (
                                                            <ImageIcon className="h-4 w-4 text-white/20 absolute inset-0 m-auto" />
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-[13px] font-medium text-white/90 hover:text-primary cursor-pointer transition-colors">
                                                            {cat.name}
                                                        </span>
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
        </AdminLayout>
    );
}
