"use client";


import {
    Plus,
    MoreVertical,
    Settings2,
    Search,
    Edit2,
    Trash2,
    X
} from "lucide-react";
import { useState, useEffect } from "react";

export default function AtributosPage() {
    const [atributos, setAtributos] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form states
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        terms: "",
        isAddon: false
    });

    const fetchAtributos = async () => {
        try {
            const res = await fetch("/api/attributes");
            const data = await res.json();
            if (Array.isArray(data)) {
                setAtributos(data);
            }
        } catch (error) {
            console.error("Error fetching attributes:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAtributos();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.slug) return;

        setIsSubmitting(true);
        try {
            const method = editingId ? "PUT" : "POST";
            const res = await fetch("/api/attributes", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editingId ? { ...formData, id: editingId } : formData)
            });

            if (res.ok) {
                setFormData({ name: "", slug: "", terms: "", isAddon: false });
                setEditingId(null);
                fetchAtributos();
            } else {
                const err = await res.json();
                alert(err.error || `Error al ${editingId ? 'actualizar' : 'crear'} atributo`);
            }
        } catch (error) {
            alert("Ocurrió un error inesperado");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (attr: any) => {
        setEditingId(attr.id);
        setFormData({
            name: attr.name,
            slug: attr.slug,
            terms: attr.terms || "",
            isAddon: attr.isAddon || false
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setFormData({ name: "", slug: "", terms: "", isAddon: false });
    };

    const handleDelete = async (id: string) => {
        if (!confirm("¿Estás seguro de que deseas eliminar este atributo?")) return;

        try {
            const res = await fetch(`/api/attributes?id=${id}`, {
                method: "DELETE"
            });

            if (res.ok) {
                fetchAtributos();
            } else {
                const err = await res.json();
                alert(err.error || "Error al eliminar atributo");
            }
        } catch (error) {
            alert("Error de conexión al eliminar");
        }
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        const slug = name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
        setFormData({ ...formData, name, slug: editingId ? formData.slug : slug });
    };

    return (
        <>
            <div className="space-y-8 animate-in fade-in duration-700">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl font-light text-white font-montserrat tracking-tight">atributos</h1>
                        <p className="text-white/40 text-[11px] uppercase tracking-widest">gestiona las variaciones de tus productos</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Formulario Lateral */}
                    <div className="lg:col-span-1 space-y-6">
                        <form onSubmit={handleSubmit} className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 space-y-4">
                            <h2 className="text-[14px] text-white font-medium mb-4">
                                {editingId ? "Editar atributo" : "Añadir nuevo atributo"}
                            </h2>

                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1">Nombre</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={handleNameChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[13px] text-white focus:outline-none focus:border-primary transition-colors"
                                    placeholder="Ej: Talle, Color, Molienda"
                                    required
                                />
                                <p className="text-[9px] text-white/20 ml-1 italic">Nombre del atributo (ej: Tamaño).</p>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1">Slug</label>
                                <input
                                    type="text"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[13px] text-white focus:outline-none focus:border-primary transition-colors"
                                    placeholder="ej-tamano"
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between ml-1">
                                    <label className="text-[10px] uppercase tracking-widest text-white/40">Términos</label>
                                </div>
                                <textarea
                                    rows={4}
                                    value={formData.terms}
                                    onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[13px] text-white focus:outline-none focus:border-primary transition-colors resize-none"
                                    placeholder="Ej: S, M, L o Roja, Azul (separados por coma)"
                                />
                                <p className="text-[9px] text-white/20 ml-1 italic">Ingresa los valores separados por comas.</p>
                            </div>

                            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 cursor-pointer group" onClick={() => setFormData({ ...formData, isAddon: !formData.isAddon })}>
                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${formData.isAddon ? 'bg-primary border-primary' : 'bg-white/5 border-white/20'}`}>
                                    {formData.isAddon && <Plus className="h-3 w-3 text-white" />}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[11px] text-white group-hover:text-primary transition-colors">¿Es un Complemento?</span>
                                    <span className="text-[9px] text-white/40 italic">Para blends, hierbas y agregados multi-selección.</span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 pt-2">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-primary hover:bg-primary-dark text-white py-3 rounded-xl text-[12px] font-medium transition-all flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? <Plus className="h-4 w-4 animate-spin" /> : (editingId ? null : <Plus className="h-4 w-4" />)}
                                    {isSubmitting ? "Procesando..." : (editingId ? "Actualizar atributo" : "Añadir nuevo atributo")}
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

                    {/* Tabla de Atributos */}
                    <div className="lg:col-span-2">
                        <div className="bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-white/5 bg-white/[0.02]">
                                            <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-medium">Nombre</th>
                                            <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-medium">Slug</th>
                                            <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-medium">Términos</th>
                                            <th className="px-6 py-4 text-right"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {isLoading ? (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-12 text-center text-white/20 text-[11px] uppercase tracking-widest">
                                                    Cargando atributos...
                                                </td>
                                            </tr>
                                        ) : atributos.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-12 text-center text-white/20 text-[11px] uppercase tracking-widest">
                                                    No hay atributos creados.
                                                </td>
                                            </tr>
                                        ) : atributos.map((attr) => (
                                            <tr key={attr.id} className="hover:bg-white/[0.02] transition-colors group">
                                                <td className="px-6 py-6">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[13px] font-medium text-primary hover:text-white cursor-pointer transition-colors">
                                                                {attr.name}
                                                            </span>
                                                            {attr.isAddon && (
                                                                <span className="text-[8px] bg-[#23553d]/40 text-white/80 border border-[#23553d]/50 px-2 py-0.5 rounded-full uppercase font-bold tracking-tighter">
                                                                    Complemento
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleEdit(attr)}
                                                                className="text-[10px] text-white/40 hover:text-white flex items-center gap-1 hover:underline"
                                                            >
                                                                <Edit2 className="h-3 w-3" /> Editar
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(attr.id)}
                                                                className="text-[10px] text-red-400/60 hover:text-red-400 flex items-center gap-1"
                                                            >
                                                                <Trash2 className="h-3 w-3" /> Borrar
                                                            </button>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6 text-[12px] text-white/60 font-mono tracking-tight">{attr.slug}</td>
                                                <td className="px-6 py-6">
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {attr.terms ? attr.terms.split(',').map((term: string, idx: number) => (
                                                            <span key={idx} className="text-[10px] text-white/40 bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                                                                {term.trim()}
                                                            </span>
                                                        )) : (
                                                            <span className="text-[10px] text-white/20 italic">Sin términos</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6 text-right">
                                                    <button className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/20 hover:text-white">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Info contextual */}
                        <div className="mt-8 p-6 bg-primary/5 border border-primary/10 rounded-2xl flex gap-4 items-start">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Settings2 className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <p className="text-[12px] text-white/90">Uso de Atributos</p>
                                <p className="text-[11px] text-white/40 leading-relaxed max-w-2xl">
                                    Los atributos te permiten definir variaciones de productos.
                                    Ingresa los términos separados por comas. Estos se usarán para generar las variantes de tus productos.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
