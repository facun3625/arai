"use client";


import {
    Plus,
    X,
    ChevronLeft,
    Image as ImageIcon,
    Video,
    Box,
    Layers,
    Save,
    Trash2,
    PlusCircle,
    Info,
    Loader2
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAdminUtils } from "@/components/admin/AdminUtilsProvider";

export default function NuevoProductoPage() {
    const { confirm, showToast } = useAdminUtils();
    const router = useRouter();
    const [categories, setCategories] = useState<any[]>([]);
    const [allAttributes, setAllAttributes] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Main Product State
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        description: "",
        type: "SIMPLE", // SIMPLE or VARIABLE
        videoUrl: "",
        categories: [] as string[],
        price: "0",
        compareAtPrice: "",
        stock: "0",
        featuredImage: "",
        images: [] as string[], // URLs
        weight: "",
        width: "",
        height: "",
        length: "",
        addons: [] as { attributeId: string, name: string, terms: string[] }[]
    });

    // Variations state
    const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);
    const [selectedTerms, setSelectedTerms] = useState<{ [key: string]: string[] }>({});
    const [variants, setVariants] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [catsRes, attrsRes] = await Promise.all([
                    fetch("/api/categories"),
                    fetch("/api/attributes")
                ]);
                setCategories(await catsRes.json());
                setAllAttributes(await attrsRes.json());
            } catch (error) {
                console.error("Error fetching dependencies:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        const slug = name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
        setFormData({ ...formData, name, slug });
    };

    const handleCategoryToggle = (id: string) => {
        const current = formData.categories;
        const updated = current.includes(id)
            ? current.filter(c => c !== id)
            : [...current, id];
        setFormData({ ...formData, categories: updated });
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
                setFormData(prev => ({ ...prev, images: [...prev.images, data.url] }));
            } else {
                showToast(data.error || "Error al subir la imagen", "error");
            }
        } catch (error) {
            showToast("Error de conexión al subir el archivo", "error");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleRemoveImage = (idx: number) => {
        setFormData({ ...formData, images: formData.images.filter((_, i) => i !== idx) });
    };

    const handleVariantFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, vIdx: number) => {
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
                const updated = [...variants];
                updated[vIdx] = { ...updated[vIdx], images: [...updated[vIdx].images, data.url] };
                setVariants(updated);
            } else {
                showToast(data.error || "Error al subir la imagen", "error");
            }
        } catch (error) {
            showToast("Error de conexión", "error");
        }
    };

    const handleRemoveVariantImage = (vIdx: number, imgIdx: number) => {
        const updated = [...variants];
        updated[vIdx] = { ...updated[vIdx], images: updated[vIdx].images.filter((_: any, i: number) => i !== imgIdx) };
        setVariants(updated);
    };

    const calculateDiscount = (price: string, comparePrice: string) => {
        const p = parseFloat(price);
        const cp = parseFloat(comparePrice);
        if (p && cp && cp > p) {
            return Math.round(((cp - p) / cp) * 100);
        }
        return 0;
    };

    // Variations Logic
    const generateVariants = () => {
        const attrs = allAttributes.filter(a => selectedAttributes.includes(a.id));
        if (attrs.length === 0) return;

        // Check if all selected attributes have at least one term selected
        const missingTerms = attrs.some(attr => !selectedTerms[attr.id] || selectedTerms[attr.id].length === 0);
        if (missingTerms) {
            showToast("Selecciona al menos un término para cada atributo", "error");
            return;
        }

        let combinations: any[] = [{}];

        attrs.forEach(attr => {
            const terms = selectedTerms[attr.id];
            const newCombinations: any[] = [];
            combinations.forEach(combo => {
                terms.forEach((term: string) => {
                    newCombinations.push({ ...combo, [attr.name]: term });
                });
            });
            combinations = newCombinations;
        });

        const newVariants = combinations.map(combo => ({
            attributes: combo,
            price: formData.price,
            compareAtPrice: formData.compareAtPrice,
            stock: formData.stock,
            images: [],
            weight: formData.weight,
            width: formData.width,
            height: formData.height,
            length: formData.length
        }));

        setVariants(newVariants);
    };

    const updateVariantField = (idx: number, field: string, value: any) => {
        const updated = [...variants];
        updated[idx] = { ...updated[idx], [field]: value };
        setVariants(updated);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.categories.length === 0) {
            showToast("Selecciona al menos una categoría", "error");
            return;
        }

        setIsSubmitting(true);
        console.log("SUBMITTING NEW PRODUCT:", { ...formData, addons: formData.addons, variants: formData.type === "VARIABLE" ? variants : [] });
        try {
            const res = await fetch("/api/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    addons: formData.addons,
                    variants: formData.type === "VARIABLE" ? variants : []
                })
            });

            if (res.ok) {
                showToast("Producto creado correctamente");
                router.push("/admin/productos");
            } else {
                const err = await res.json();
                showToast(err.error || "Error al crear producto", "error");
            }
        } catch (error) {
            showToast("Error de conexión", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <div className="p-8 text-white/20 uppercase tracking-widest text-center">Cargando...</div>;

    return (
        <>
            <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Header Contextual */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/productos" className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/40 hover:text-white">
                            <ChevronLeft className="h-5 w-5" />
                        </Link>
                        <div className="flex flex-col gap-1">
                            <h1 className="text-2xl font-light text-white font-montserrat tracking-tight">nuevo producto</h1>
                            <p className="text-white/40 text-[11px] uppercase tracking-widest">crea un artículo en tu catálogo</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/admin/productos" className="px-6 py-2.5 rounded-full text-[11px] text-white/40 hover:text-white transition-colors">
                            Cancelar
                        </Link>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-primary hover:bg-[#1a3f2d] text-white px-8 py-2.5 rounded-full text-[11px] font-medium flex items-center gap-2 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                        >
                            <Save className="h-4 w-4" />
                            {isSubmitting ? "Guardando..." : "Publicar Producto"}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Columna Principal (2/3) */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Información Básica */}
                        <section className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 space-y-6">
                            <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-6">
                                <Info className="h-4 w-4 text-primary" />
                                <h2 className="text-[14px] text-white font-medium uppercase tracking-wider">Información General</h2>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1">Título del Producto</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={handleNameChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-[15px] text-white focus:outline-none focus:border-primary transition-all font-light"
                                        placeholder="Ej: Café de Especialidad - Blend House"
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1">Slug (URL)</label>
                                    <input
                                        type="text"
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[12px] text-white/60 font-mono focus:outline-none focus:border-primary transition-all"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1">Características / Descripción</label>
                                    <textarea
                                        rows={6}
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-[14px] text-white focus:outline-none focus:border-primary transition-all resize-none leading-relaxed"
                                        placeholder="Describe las propiedades, origen y notas de cata..."
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Media Section */}
                        <section className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 space-y-6">
                            <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-6">
                                <ImageIcon className="h-4 w-4 text-primary" />
                                <h2 className="text-[14px] text-white font-medium uppercase tracking-wider">Multimedia</h2>
                            </div>

                            <div className="space-y-6">
                                {/* Galería de Imágenes */}
                                <div className="space-y-3">
                                    <label className="text-[10px] uppercase tracking-widest text-white/40">Imágenes del Producto</label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                        {formData.images.map((img, idx) => (
                                            <div key={idx} className={`aspect-square bg-white/5 rounded-2xl border ${formData.featuredImage === img ? 'border-primary' : 'border-white/10'} relative group overflow-hidden`}>
                                                <Image src={img} alt={`Preview ${idx}`} fill className="object-cover" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, featuredImage: img })}
                                                        className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${formData.featuredImage === img ? 'bg-primary text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                                                    >
                                                        {formData.featuredImage === img ? 'Destacada' : 'Hacer Principal'}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveImage(idx)}
                                                        className="p-1.5 bg-red-500 rounded-full text-white shadow-lg"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </div>
                                                {formData.featuredImage === img && (
                                                    <div className="absolute top-2 left-2 bg-primary px-2 py-0.5 rounded-full">
                                                        <ImageIcon className="h-2.5 w-2.5 text-white" />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            disabled={isUploading}
                                            onClick={() => fileInputRef.current?.click()}
                                            className="aspect-square rounded-2xl border-2 border-dashed border-white/10 hover:border-primary/40 hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-2 group disabled:opacity-50"
                                        >
                                            {isUploading ? (
                                                <Loader2 className="h-6 w-6 text-primary animate-spin" />
                                            ) : (
                                                <PlusCircle className="h-6 w-6 text-white/10 group-hover:text-primary transition-colors" />
                                            )}
                                            <span className="text-[9px] uppercase tracking-widest text-white/20 group-hover:text-primary transition-colors">
                                                {isUploading ? "Subiendo..." : "Subir Imagen"}
                                            </span>
                                        </button>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileUpload}
                                            className="hidden"
                                            accept="image/*"
                                        />
                                    </div>
                                </div>

                                {/* Video Link */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1">Video Relacionado (Link Youtube/Vimeo)</label>
                                    <div className="relative">
                                        <Video className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                                        <input
                                            type="url"
                                            value={formData.videoUrl}
                                            onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-[13px] text-white focus:outline-none focus:border-primary transition-all"
                                            placeholder="https://youtube.com/watch?v=..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Inventory & Dimensions (only if SIMPLE) */}
                        {formData.type === "SIMPLE" && (
                            <section className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 space-y-6">
                                <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-6">
                                    <Box className="h-4 w-4 text-primary" />
                                    <h2 className="text-[14px] text-white font-medium uppercase tracking-wider">Inventario y Envío</h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <div className="space-y-1.5 focus-within:z-10">
                                            <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1">Stock Actual</label>
                                            <input
                                                type="number"
                                                value={formData.stock}
                                                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none transition-all"
                                                placeholder="0"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5 focus-within:z-10">
                                                <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1">Precio Actual ($)</label>
                                                <input
                                                    type="number"
                                                    value={formData.price}
                                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none transition-all placeholder:text-white/10"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                            <div className="space-y-1.5 focus-within:z-10">
                                                <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1">Precio Anterior ($)</label>
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        value={formData.compareAtPrice}
                                                        onChange={(e) => setFormData({ ...formData, compareAtPrice: e.target.value })}
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none transition-all placeholder:text-white/10"
                                                        placeholder="0.00"
                                                    />
                                                    {calculateDiscount(formData.price, formData.compareAtPrice) > 0 && (
                                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-primary/20 text-primary text-[10px] font-bold rounded-md">
                                                            -{calculateDiscount(formData.price, formData.compareAtPrice)}%
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1">Peso (kg)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={formData.weight}
                                                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none"
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1">Dimensiones (Ancho x Alto x Largo cm)</label>
                                            <div className="grid grid-cols-3 gap-2">
                                                <input
                                                    type="number"
                                                    value={formData.width}
                                                    onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                                                    placeholder="An"
                                                    className="bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-white focus:border-primary outline-none text-center"
                                                />
                                                <input
                                                    type="number"
                                                    value={formData.height}
                                                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                                                    placeholder="Al"
                                                    className="bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-white focus:border-primary outline-none text-center"
                                                />
                                                <input
                                                    type="number"
                                                    value={formData.length}
                                                    onChange={(e) => setFormData({ ...formData, length: e.target.value })}
                                                    placeholder="La"
                                                    className="bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-white focus:border-primary outline-none text-center"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Variables Logic */}
                        {formData.type === "VARIABLE" && (
                            <section className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 space-y-6">
                                <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-6">
                                    <Layers className="h-4 w-4 text-primary" />
                                    <h2 className="text-[14px] text-white font-medium uppercase tracking-wider">Variantes del Producto</h2>
                                </div>

                                <div className="space-y-6">
                                    {/* Selección de Atributos */}
                                    <div className="bg-white/5 p-6 rounded-2xl border border-white/5 space-y-6">
                                        <div className="space-y-4">
                                            <p className="text-[11px] text-white/60">Selecciona los atributos y términos:</p>
                                            <div className="flex flex-wrap gap-3">
                                                {allAttributes.filter(a => !a.isAddon).length === 0 ? (
                                                    <p className="text-[10px] text-white/20 italic">No hay atributos definidos como variaciones.</p>
                                                ) : allAttributes.filter(a => !a.isAddon).map(attr => (
                                                    <label key={attr.id} className="flex items-center gap-2 cursor-pointer group">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedAttributes.includes(attr.id)}
                                                            onChange={() => {
                                                                const upd = selectedAttributes.includes(attr.id)
                                                                    ? selectedAttributes.filter(id => id !== attr.id)
                                                                    : [...selectedAttributes, attr.id];
                                                                setSelectedAttributes(upd);
                                                            }}
                                                            className="hidden"
                                                        />
                                                        <div className={`px-4 py-2 rounded-xl border text-[11px] transition-all shadow-sm ${selectedAttributes.includes(attr.id)
                                                            ? 'border-primary bg-primary/20 text-primary font-bold'
                                                            : 'border-white/10 text-white/30 hover:border-white/20'
                                                            }`}>
                                                            {attr.name}
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Show terms for selected attributes */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                            {selectedAttributes.map(attrId => {
                                                const attr = allAttributes.find(a => a.id === attrId);
                                                if (!attr) return null;
                                                const terms = attr.terms.split(/[,\.;\n]+/).map((t: string) => t.trim()).filter(Boolean);
                                                return (
                                                    <div key={attrId} className="bg-white/[0.02] p-4 rounded-2xl border border-white/5 space-y-3">
                                                        <p className="text-[10px] uppercase tracking-widest text-primary font-bold">{attr.name}</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {terms.map((term: string) => (
                                                                <label key={term} className="flex items-center gap-2 cursor-pointer">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={selectedTerms[attrId]?.includes(term) || false}
                                                                        onChange={() => {
                                                                            const current = selectedTerms[attrId] || [];
                                                                            const upd = current.includes(term)
                                                                                ? current.filter(t => t !== term)
                                                                                : [...current, term];
                                                                            setSelectedTerms({ ...selectedTerms, [attrId]: upd });
                                                                        }}
                                                                        className="hidden"
                                                                    />
                                                                    <div className={`px-3 py-1.5 rounded-lg border text-[10px] transition-all ${selectedTerms[attrId]?.includes(term)
                                                                        ? 'border-primary bg-primary/20 text-primary'
                                                                        : 'border-white/5 text-white/30 hover:border-white/20'
                                                                        }`}>
                                                                        {term}
                                                                    </div>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <button
                                            type="button"
                                            onClick={generateVariants}
                                            className="px-8 py-3.5 bg-primary/10 hover:bg-primary/20 text-primary text-[10px] uppercase tracking-widest font-bold rounded-2xl transition-all w-full border border-primary/20"
                                        >
                                            Generar / Actualizar Variaciones
                                        </button>
                                    </div>

                                    {/* Listado de Variantes */}
                                    <div className="space-y-4">
                                        {variants.map((variant, vIdx) => (
                                            <div key={vIdx} className="bg-white/[0.03] border border-white/5 rounded-3xl p-6 space-y-6 animate-in fade-in duration-500">
                                                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                                                    <div className="flex items-center gap-2">
                                                        <Layers className="h-4 w-4 text-primary/40 mr-2" />
                                                        {Object.entries(variant.attributes).map(([k, v]: [any, any]) => (
                                                            <span key={k} className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                                                                {k}: {v}
                                                            </span>
                                                        ))}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => setVariants(variants.filter((_, i) => i !== vIdx))}
                                                        className="p-2 hover:bg-red-500/10 text-white/20 hover:text-red-400 rounded-full transition-all"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                    <div className="space-y-4">
                                                        <div className="grid grid-cols-3 gap-4">
                                                            <div className="space-y-1">
                                                                <label className="text-[9px] uppercase tracking-widest text-white/20 ml-1">Precio</label>
                                                                <input
                                                                    type="number"
                                                                    value={variant.price}
                                                                    onChange={(e) => updateVariantField(vIdx, 'price', e.target.value)}
                                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[14px] text-white focus:border-primary outline-none transition-all"
                                                                />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <label className="text-[9px] uppercase tracking-widest text-white/20 ml-1">P. Anterior</label>
                                                                <div className="relative">
                                                                    <input
                                                                        type="number"
                                                                        value={variant.compareAtPrice}
                                                                        onChange={(e) => updateVariantField(vIdx, 'compareAtPrice', e.target.value)}
                                                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[14px] text-white focus:border-primary outline-none transition-all"
                                                                    />
                                                                    {calculateDiscount(variant.price, variant.compareAtPrice) > 0 && (
                                                                        <span className="absolute right-2 top-1/2 -translate-y-1/2 px-1.5 py-0.5 bg-primary/20 text-primary text-[8px] font-bold rounded">
                                                                            -{calculateDiscount(variant.price, variant.compareAtPrice)}%
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <label className="text-[9px] uppercase tracking-widest text-white/20 ml-1">Stock</label>
                                                                <input
                                                                    type="number"
                                                                    value={variant.stock}
                                                                    onChange={(e) => updateVariantField(vIdx, 'stock', e.target.value)}
                                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[14px] text-white focus:border-primary outline-none transition-all"
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Images for variant */}
                                                        <div className="space-y-2">
                                                            <label className="text-[9px] uppercase tracking-widest text-white/20 ml-1">Imágenes de la variación</label>
                                                            <div className="flex flex-wrap gap-2">
                                                                {variant.images.map((img: string, iIdx: number) => (
                                                                    <div key={iIdx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-white/10 group">
                                                                        <Image src={img} alt="Variant" fill className="object-cover" />
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleRemoveVariantImage(vIdx, iIdx)}
                                                                            className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                        >
                                                                            <X className="h-4 w-4 text-white" />
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                                <label className="w-16 h-16 rounded-xl border-2 border-dashed border-white/5 hover:border-primary/40 hover:bg-primary/5 flex items-center justify-center cursor-pointer transition-all group">
                                                                    <PlusCircle className="h-5 w-5 text-white/10 group-hover:text-primary transition-colors" />
                                                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleVariantFileUpload(e, vIdx)} />
                                                                </label>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-4">
                                                        <div className="space-y-1">
                                                            <label className="text-[9px] uppercase tracking-widest text-white/20 ml-1">Peso (kg)</label>
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                value={variant.weight}
                                                                onChange={(e) => updateVariantField(vIdx, 'weight', e.target.value)}
                                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[14px] text-white focus:border-primary outline-none transition-all"
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[9px] uppercase tracking-widest text-white/20 ml-1">Dimensiones (An x Al x La cm)</label>
                                                            <div className="flex gap-2">
                                                                <input type="number" value={variant.width} onChange={(e) => updateVariantField(vIdx, 'width', e.target.value)} placeholder="W" className="w-1/3 bg-white/5 border border-white/10 rounded-xl py-3 text-[12px] text-center text-white focus:border-primary outline-none transition-all" />
                                                                <input type="number" value={variant.height} onChange={(e) => updateVariantField(vIdx, 'height', e.target.value)} placeholder="H" className="w-1/3 bg-white/5 border border-white/10 rounded-xl py-3 text-[12px] text-center text-white focus:border-primary outline-none transition-all" />
                                                                <input type="number" value={variant.length} onChange={(e) => updateVariantField(vIdx, 'length', e.target.value)} placeholder="L" className="w-1/3 bg-white/5 border border-white/10 rounded-xl py-3 text-[12px] text-center text-white focus:border-primary outline-none transition-all" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Complementos / Add-ons */}
                        <section className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 space-y-6">
                            <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-6">
                                <PlusCircle className="h-4 w-4 text-primary" />
                                <h2 className="text-[14px] text-white font-medium uppercase tracking-wider">Complementos (Multi-selección)</h2>
                            </div>

                            <p className="text-[11px] text-white/40 leading-relaxed -mt-4 mb-6">
                                Selecciona qué atributos quieres que aparezcan como complementos elegibles por el cliente (ej: Blends, Hierbas).
                                A diferencia de las variaciones, el cliente podrá seleccionar múltiples opciones.
                            </p>

                            <div className="space-y-6">
                                <div className="flex flex-wrap gap-3">
                                    {allAttributes.filter(a => a.isAddon).length === 0 ? (
                                        <p className="text-[10px] text-white/20 italic">No hay atributos definidos como complementos. Marca alguno como 'Complemento' en la sección de atributos.</p>
                                    ) : allAttributes.filter(a => a.isAddon).map(attr => {
                                        const isSelected = formData.addons.some(a => a.attributeId === attr.id);
                                        return (
                                            <button
                                                key={attr.id}
                                                type="button"
                                                onClick={() => {
                                                    if (isSelected) {
                                                        setFormData({ ...formData, addons: formData.addons.filter(a => a.attributeId !== attr.id) });
                                                    } else {
                                                        setFormData({ ...formData, addons: [...formData.addons, { attributeId: attr.id, name: attr.name, terms: [] }] });
                                                    }
                                                }}
                                                className={`px-4 py-2 rounded-xl border text-[11px] transition-all ${isSelected
                                                    ? 'border-primary bg-primary/20 text-primary font-bold'
                                                    : 'border-white/10 text-white/30 hover:border-white/20'
                                                    }`}
                                            >
                                                {attr.name}
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {formData.addons.map((addon, idx) => {
                                        const fullAttr = allAttributes.find(a => a.id === addon.attributeId);
                                        if (!fullAttr) return null;
                                        const availableTerms = fullAttr.terms.split(/[,\.;\n]+/).map((t: string) => t.trim()).filter(Boolean);

                                        return (
                                            <div key={addon.attributeId} className="bg-white/[0.02] p-5 rounded-2xl border border-white/5 space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-[10px] uppercase tracking-widest text-primary font-bold">{addon.name}</p>
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, addons: formData.addons.filter(a => a.attributeId !== addon.attributeId) })}
                                                        className="text-white/20 hover:text-red-400 p-1"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {availableTerms.map((term: string) => (
                                                        <label key={term} className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={addon.terms.includes(term)}
                                                                onChange={() => {
                                                                    const updatedAddons = [...formData.addons];
                                                                    const currentTerms = addon.terms;
                                                                    const newTerms = currentTerms.includes(term)
                                                                        ? currentTerms.filter(t => t !== term)
                                                                        : [...currentTerms, term];
                                                                    updatedAddons[idx] = { ...addon, terms: newTerms };
                                                                    setFormData({ ...formData, addons: updatedAddons });
                                                                }}
                                                                className="hidden"
                                                            />
                                                            <div className={`px-3 py-1.5 rounded-lg border text-[10px] transition-all ${addon.terms.includes(term)
                                                                ? 'border-primary bg-primary/20 text-primary'
                                                                : 'border-white/5 text-white/30 hover:border-white/20'
                                                                }`}>
                                                                {term}
                                                            </div>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Columna Lateral (1/3) */}
                    <div className="space-y-6">
                        {/* Tipo de Producto */}
                        <section className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 space-y-4">
                            <label className="text-[10px] uppercase tracking-widest text-white/40 block">Configuración de Producto</label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type: "SIMPLE" })}
                                    className={`py-3 rounded-2xl text-[11px] font-medium transition-all ${formData.type === "SIMPLE"
                                        ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                        : 'bg-white/5 text-white/40 hover:bg-white/10'
                                        }`}
                                >
                                    Simple
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type: "VARIABLE" })}
                                    className={`py-3 rounded-2xl text-[11px] font-medium transition-all ${formData.type === "VARIABLE"
                                        ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                        : 'bg-white/5 text-white/40 hover:bg-white/10'
                                        }`}
                                >
                                    Variable
                                </button>
                            </div>
                        </section>

                        {/* Categorías */}
                        <section className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 space-y-4">
                            <label className="text-[10px] uppercase tracking-widest text-white/40 block">Categorías</label>
                            <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                {categories.map((cat) => (
                                    <label key={cat.id} className="flex items-center gap-3 group cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.categories.includes(cat.id)}
                                            onChange={() => handleCategoryToggle(cat.id)}
                                            className="w-4 h-4 rounded border-white/10 bg-white/5 text-primary focus:ring-primary/20"
                                        />
                                        <span className={`text-[12px] transition-colors ${formData.categories.includes(cat.id) ? 'text-white' : 'text-white/40 group-hover:text-white/60'}`}>
                                            {cat.name}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </section>

                        {/* Ayuda/Tips */}
                        <div className="p-6 bg-primary/5 rounded-3xl border border-primary/10">
                            <h3 className="text-[11px] font-bold text-primary uppercase tracking-widest mb-2">Tip: Variaciones</h3>
                            <p className="text-[11px] text-white/40 leading-relaxed">
                                Si el producto tiene diferentes talles o colores, cámbialo a "Variable".
                                Podrás generar automáticamente todas las combinaciones y asignarles stock independiente.
                            </p>
                        </div>
                    </div>
                </div>
            </form>
        </>
    );
}
