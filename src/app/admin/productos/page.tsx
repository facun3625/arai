"use client";


import {
    Plus,
    Package,
    Search,
    Edit2,
    Trash2,
    Image as ImageIcon,
    ExternalLink,
    Filter,
    EyeOff,
    Eye
} from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAdminUtils } from "@/components/admin/AdminUtilsProvider";

export default function ProductosPage() {
    const { confirm, showToast } = useAdminUtils();
    const [productos, setProductos] = useState<any[]>([]);
    const [categorias, setCategorias] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");

    const fetchProductos = async () => {
        try {
            const [prodRes, catRes] = await Promise.all([
                fetch("/api/products?admin=1"),
                fetch("/api/categories")
            ]);
            const prodData = await prodRes.json();
            const catData = await catRes.json();
            if (Array.isArray(prodData)) setProductos(prodData);
            if (Array.isArray(catData)) setCategorias(catData);
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProductos();
    }, []);

    const filtered = productos.filter(p => {
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.slug.toLowerCase().includes(search.toLowerCase());
        const matchCat = !selectedCategory ||
            p.categories.some((c: any) => c.id === selectedCategory);
        return matchSearch && matchCat;
    });

    const handleToggleActive = async (id: string, currentActive: boolean) => {
        try {
            const res = await fetch("/api/products", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, isActive: !currentActive })
            });
            if (res.ok) {
                showToast(currentActive ? "Producto ocultado de la tienda" : "Producto publicado en la tienda");
                setProductos(prev => prev.map(p => p.id === id ? { ...p, isActive: !currentActive } : p));
            }
        } catch {
            showToast("Error al actualizar producto", "error");
        }
    };

    const handleDelete = async (id: string) => {
        const ok = await confirm({
            title: "¿Eliminar producto?",
            message: "¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.",
            confirmText: "Eliminar",
            type: "danger"
        });

        if (!ok) return;

        try {
            const res = await fetch(`/api/products?id=${id}`, {
                method: "DELETE"
            });

            if (res.ok) {
                showToast("Producto eliminado");
                fetchProductos();
            } else {
                const err = await res.json();
                showToast(err.error || "Error al eliminar producto", "error");
            }
        } catch (error) {
            showToast("Error de conexión al eliminar", "error");
        }
    };

    return (
        <>
            <div className="space-y-8 animate-in fade-in duration-700">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl font-light text-white font-montserrat tracking-tight">productos</h1>
                        <p className="text-white/40 text-[11px] uppercase tracking-widest">gestiona el catálogo de tu tienda</p>
                    </div>
                    <Link
                        href="/admin/productos/nuevo"
                        className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-full text-[11px] font-medium flex items-center gap-2 transition-all shadow-lg shadow-primary/20"
                    >
                        <Plus className="h-4 w-4" />
                        Añadir nuevo producto
                    </Link>
                </div>

                {/* Filtros y Búsqueda */}
                <div className="flex flex-col md:flex-row gap-3 items-center">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Buscar por nombre o slug..."
                            className="w-full bg-white/[0.03] border border-white/5 rounded-2xl pl-11 pr-4 py-3 text-[13px] text-white focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 pointer-events-none" />
                        <select
                            value={selectedCategory}
                            onChange={e => setSelectedCategory(e.target.value)}
                            className="bg-white/[0.03] border border-white/5 rounded-2xl pl-11 pr-8 py-3 text-[13px] text-white/60 focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer min-w-[180px]"
                        >
                            <option value="" className="bg-gray-900">Todas las categorías</option>
                            {categorias.map(cat => (
                                <option key={cat.id} value={cat.id} className="bg-gray-900">{cat.name}</option>
                            ))}
                        </select>
                    </div>
                    {(search || selectedCategory) && (
                        <button
                            onClick={() => { setSearch(""); setSelectedCategory(""); }}
                            className="text-[11px] text-white/30 hover:text-white/60 transition-colors whitespace-nowrap"
                        >
                            Limpiar filtros
                        </button>
                    )}
                    <span className="text-[11px] text-white/20 ml-auto">
                        {filtered.length} de {productos.length} productos
                    </span>
                </div>

                {/* Tabla de Productos */}
                <div className="bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden mt-8">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/[0.02]">
                                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-medium">Producto</th>
                                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-medium">Categoría</th>
                                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-medium">Precio</th>
                                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-medium">Stock</th>
                                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-medium">Tipo</th>
                                    <th className="px-6 py-4 text-right"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-white/20 text-[11px] uppercase tracking-widest">
                                            Cargando productos...
                                        </td>
                                    </tr>
                                ) : productos.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-white/20 text-[11px] uppercase tracking-widest">
                                            No hay productos en el catálogo.
                                        </td>
                                    </tr>
                                ) : filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-white/20 text-[11px] uppercase tracking-widest">
                                            No hay productos que coincidan con los filtros.
                                        </td>
                                    </tr>
                                ) : filtered.map((prod) => {
                                    const images = JSON.parse(prod.images || "[]");
                                    const mainImage = images[0] || null;

                                    return (
                                        <tr key={prod.id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-6 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-xl bg-white/5 overflow-hidden flex items-center justify-center border border-white/5 relative">
                                                        {mainImage ? (
                                                            <Image
                                                                src={mainImage}
                                                                alt={prod.name}
                                                                fill
                                                                className="object-cover"
                                                                sizes="48px"
                                                            />
                                                        ) : (
                                                            <ImageIcon className="h-5 w-5 text-white/10" />
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="text-[13px] font-medium text-white group-hover:text-primary transition-colors">
                                                            {prod.name}
                                                        </span>
                                                        <span className="text-[10px] text-white/20 font-mono">{prod.slug}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="flex flex-wrap gap-1">
                                                    {prod.categories.map((cat: any) => (
                                                        <span key={cat.id} className="text-[10px] text-white/40 bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                                                            {cat.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 text-[13px] text-white/80">
                                                {prod.type === "VARIABLE" ? (
                                                    <span className="text-white/40 italic">Variable...</span>
                                                ) : (
                                                    `$${prod.price.toLocaleString()}`
                                                )}
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="flex items-center gap-2">
                                                    <div className={`h-1.5 w-1.5 rounded-full ${prod.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                                                    <span className="text-[13px] text-white/60">{prod.stock}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <span className={`text-[9px] uppercase tracking-widest px-2 py-1 rounded-full border ${prod.type === 'VARIABLE'
                                                        ? 'border-purple-500/20 text-purple-400 bg-purple-500/5'
                                                        : 'border-blue-500/20 text-blue-400 bg-blue-500/5'
                                                    }`}>
                                                    {prod.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-6 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleToggleActive(prod.id, prod.isActive !== false)}
                                                        title={prod.isActive === false ? "Publicar en tienda" : "Ocultar de tienda"}
                                                        className={`p-2 rounded-lg transition-colors ${prod.isActive === false ? "text-yellow-400 hover:bg-yellow-400/10" : "text-white/40 hover:text-yellow-400 hover:bg-yellow-400/5"}`}
                                                    >
                                                        {prod.isActive === false ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                                    </button>
                                                    <Link
                                                        href={`/admin/productos/editar/${prod.id}`}
                                                        className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white/40 hover:text-white"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(prod.id)}
                                                        className="p-2 hover:bg-red-400/5 rounded-lg transition-colors text-red-400/60 hover:text-red-400"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                                {prod.isActive === false && (
                                                    <span className="text-[9px] uppercase tracking-widest text-yellow-500/60 font-bold">oculto</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer contextual */}
                <div className="p-6 bg-primary/5 border border-primary/10 rounded-2xl flex gap-4 items-start">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Package className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <p className="text-[12px] text-white/90">Inventario y Catálogo</p>
                        <p className="text-[11px] text-white/40 leading-relaxed max-w-2xl">
                            Aquí puedes ver todos tus productos. Haz clic en "Añadir nuevo" para crear uno,
                            o usa las acciones de edición para modificar precios, stock o variaciones.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
