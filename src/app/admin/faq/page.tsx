"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useAdminUtils } from "@/components/admin/AdminUtilsProvider";
import { HelpCircle, Plus, Trash2, ArrowUp, ArrowDown, Eye, EyeOff, Save, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface FaqItem {
    id: string;
    question: string;
    answer: string;
    order: number;
    isActive: boolean;
}

export default function AdminFaqPage() {
    const { user } = useAuthStore();
    const { confirm, showToast } = useAdminUtils();
    const [items, setItems] = useState<FaqItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);
    const [newItem, setNewItem] = useState({ question: "", answer: "" });
    const [isCreating, setIsCreating] = useState(false);
    const [editing, setEditing] = useState<Record<string, { question: string; answer: string }>>({});

    const fetchItems = async () => {
        if (!user?.id) return;
        try {
            const res = await fetch(`/api/faq?admin=1&adminId=${user.id}`);
            const data = await res.json();
            if (Array.isArray(data)) setItems(data);
        } catch {
            showToast("Error al cargar las preguntas", "error");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, [user?.id]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItem.question.trim() || !newItem.answer.trim()) return;
        setIsCreating(true);
        try {
            const res = await fetch("/api/faq", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...newItem, adminId: user?.id }),
            });
            if (res.ok) {
                const item = await res.json();
                setItems(prev => [...prev, item]);
                setNewItem({ question: "", answer: "" });
                showToast("Pregunta agregada");
            } else {
                showToast("Error al agregar la pregunta", "error");
            }
        } catch {
            showToast("Error de conexión", "error");
        } finally {
            setIsCreating(false);
        }
    };

    const updateItem = async (id: string, data: Partial<FaqItem>) => {
        setUpdating(id);
        try {
            const res = await fetch("/api/faq", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, adminId: user?.id, ...data }),
            });
            if (res.ok) {
                const updated = await res.json();
                setItems(prev => prev.map(i => i.id === id ? updated : i));
            } else {
                showToast("Error al actualizar", "error");
            }
        } catch {
            showToast("Error de conexión", "error");
        } finally {
            setUpdating(null);
        }
    };

    const saveEdit = async (id: string) => {
        const edit = editing[id];
        if (!edit) return;
        await updateItem(id, edit);
        setEditing(prev => {
            const next = { ...prev };
            delete next[id];
            return next;
        });
        showToast("Pregunta actualizada");
    };

    const moveItem = async (index: number, direction: -1 | 1) => {
        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= items.length) return;
        const a = items[index];
        const b = items[targetIndex];
        const next = [...items];
        next[index] = { ...b, order: a.order };
        next[targetIndex] = { ...a, order: b.order };
        next.sort((x, y) => x.order - y.order);
        setItems(next);
        await Promise.all([
            updateItem(a.id, { order: b.order }),
            updateItem(b.id, { order: a.order }),
        ]);
    };

    const deleteItem = async (id: string) => {
        const ok = await confirm({
            title: "¿Eliminar pregunta?",
            message: "Esta acción no se puede deshacer.",
            confirmText: "Eliminar",
            type: "danger",
        });
        if (!ok) return;
        try {
            const res = await fetch(`/api/faq?id=${id}&adminId=${user?.id}`, { method: "DELETE" });
            if (res.ok) {
                setItems(prev => prev.filter(i => i.id !== id));
                showToast("Pregunta eliminada");
            }
        } catch {
            showToast("Error al eliminar", "error");
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-20">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-light text-slate-900 font-montserrat tracking-tight">preguntas frecuentes</h1>
                <p className="text-slate-600 text-[11px] uppercase tracking-widest">se muestran en /faq, ordenadas de arriba hacia abajo</p>
            </div>

            {/* New item form */}
            <form onSubmit={handleCreate} className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4">
                <p className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">Nueva pregunta</p>
                <input
                    type="text"
                    value={newItem.question}
                    onChange={(e) => setNewItem(prev => ({ ...prev, question: e.target.value }))}
                    placeholder="Ej: ¿Cuánto tarda en llegar mi pedido?"
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-[13px] focus:outline-none focus:border-slate-200 placeholder:text-slate-500"
                />
                <textarea
                    rows={3}
                    value={newItem.answer}
                    onChange={(e) => setNewItem(prev => ({ ...prev, answer: e.target.value }))}
                    placeholder="Respuesta..."
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-[13px] focus:outline-none focus:border-slate-200 placeholder:text-slate-500 resize-none"
                />
                <button
                    type="submit"
                    disabled={isCreating || !newItem.question.trim() || !newItem.answer.trim()}
                    className="px-5 py-2.5 bg-primary text-white rounded-xl text-[11px] font-bold uppercase tracking-widest disabled:opacity-50 flex items-center gap-2"
                >
                    {isCreating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                    Agregar
                </button>
            </form>

            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden divide-y divide-slate-200">
                {isLoading ? (
                    <div className="px-6 py-12 text-center text-slate-500 text-[11px] uppercase tracking-widest">Cargando...</div>
                ) : items.length === 0 ? (
                    <div className="px-6 py-24 text-center">
                        <HelpCircle className="h-8 w-8 text-slate-500 mx-auto mb-4" />
                        <p className="text-slate-500 text-[11px] uppercase tracking-widest">Todavía no hay preguntas cargadas.</p>
                    </div>
                ) : items.map((item, index) => {
                    const edit = editing[item.id];
                    return (
                        <motion.div key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 space-y-3">
                            <div className="flex items-start gap-3">
                                <div className="flex flex-col gap-1 pt-1">
                                    <button disabled={index === 0} onClick={() => moveItem(index, -1)} className="text-slate-500 hover:text-slate-900 disabled:opacity-20 transition-colors">
                                        <ArrowUp className="h-3.5 w-3.5" />
                                    </button>
                                    <button disabled={index === items.length - 1} onClick={() => moveItem(index, 1)} className="text-slate-500 hover:text-slate-900 disabled:opacity-20 transition-colors">
                                        <ArrowDown className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                                <div className="flex-1 space-y-2">
                                    <input
                                        value={edit?.question ?? item.question}
                                        onChange={(e) => setEditing(prev => ({ ...prev, [item.id]: { question: e.target.value, answer: prev[item.id]?.answer ?? item.answer } }))}
                                        className="w-full bg-transparent text-slate-900 text-[14px] font-medium focus:outline-none border-b border-transparent focus:border-slate-200 pb-1"
                                    />
                                    <textarea
                                        rows={2}
                                        value={edit?.answer ?? item.answer}
                                        onChange={(e) => setEditing(prev => ({ ...prev, [item.id]: { question: prev[item.id]?.question ?? item.question, answer: e.target.value } }))}
                                        className="w-full bg-transparent text-slate-600 text-[13px] focus:outline-none resize-none"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center justify-between pl-6">
                                <button
                                    onClick={() => updateItem(item.id, { isActive: !item.isActive })}
                                    disabled={updating === item.id}
                                    className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full transition-all ${item.isActive ? "bg-emerald-500/10 text-emerald-700" : "bg-slate-50 text-slate-600"}`}
                                >
                                    {item.isActive ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                                    {item.isActive ? "Visible" : "Oculta"}
                                </button>
                                <div className="flex items-center gap-2">
                                    {edit && (
                                        <button
                                            onClick={() => saveEdit(item.id)}
                                            disabled={updating === item.id}
                                            className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-all"
                                        >
                                            <Save className="h-3 w-3" /> Guardar
                                        </button>
                                    )}
                                    <button
                                        onClick={() => deleteItem(item.id)}
                                        className="p-1.5 rounded-full text-red-700/70 hover:bg-red-500/10 hover:text-red-700 transition-all"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
