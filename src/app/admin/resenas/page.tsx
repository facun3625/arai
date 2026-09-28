"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useAdminUtils } from "@/components/admin/AdminUtilsProvider";
import { Star, Clock, CheckCircle, ShieldCheck, Trash2, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

interface Review {
    id: string;
    authorName: string;
    rating: number;
    comment: string;
    isVerified: boolean;
    isApproved: boolean;
    createdAt: string;
    product: { name: string; slug: string };
}

export default function AdminResenasPage() {
    const { user } = useAuthStore();
    const { showToast } = useAdminUtils();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);

    const fetchReviews = async () => {
        if (!user?.id) return;
        try {
            const res = await fetch(`/api/reviews?admin=1&adminId=${user.id}`);
            const data = await res.json();
            if (Array.isArray(data)) setReviews(data);
        } catch {
            showToast("Error al cargar reseñas", "error");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [user?.id]);

    const setApproval = async (id: string, isApproved: boolean) => {
        setUpdating(id);
        try {
            const res = await fetch("/api/reviews", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, isApproved, adminId: user?.id }),
            });
            if (res.ok) {
                setReviews(prev => prev.map(r => r.id === id ? { ...r, isApproved } : r));
                showToast(isApproved ? "Reseña publicada" : "Reseña ocultada");
            }
        } catch {
            showToast("Error al actualizar", "error");
        } finally {
            setUpdating(null);
        }
    };

    const deleteReview = async (id: string) => {
        if (!confirm("¿Eliminar esta reseña permanentemente?")) return;
        setUpdating(id);
        try {
            const res = await fetch(`/api/reviews?id=${id}&adminId=${user?.id}`, { method: "DELETE" });
            if (res.ok) {
                setReviews(prev => prev.filter(r => r.id !== id));
                showToast("Reseña eliminada");
            }
        } catch {
            showToast("Error al eliminar", "error");
        } finally {
            setUpdating(null);
        }
    };

    const pending = reviews.filter(r => !r.isApproved);
    const approved = reviews.filter(r => r.isApproved);

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-20">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-light text-slate-900 font-montserrat tracking-tight">reseñas</h1>
                <p className="text-slate-600 text-[11px] uppercase tracking-widest">moderación · calificaciones de clientes</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-3xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <Clock className="h-4 w-4 text-orange-700" />
                        <span className="text-[10px] uppercase tracking-widest font-bold text-orange-700">Pendientes</span>
                    </div>
                    <p className="text-3xl font-light font-montserrat text-slate-900">{pending.length}</p>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <CheckCircle className="h-4 w-4 text-emerald-700" />
                        <span className="text-[10px] uppercase tracking-widest font-bold text-emerald-700">Publicadas</span>
                    </div>
                    <p className="text-3xl font-light font-montserrat text-slate-900">{approved.length}</p>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden divide-y divide-slate-200">
                {isLoading ? (
                    <div className="px-6 py-12 text-center text-slate-500 text-[11px] uppercase tracking-widest">
                        Cargando reseñas...
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="px-6 py-24 text-center">
                        <MessageSquare className="h-8 w-8 text-slate-500 mx-auto mb-4" />
                        <p className="text-slate-500 text-[11px] uppercase tracking-widest">
                            Todavía no hay reseñas.
                        </p>
                    </div>
                ) : reviews.map((review) => (
                    <motion.div
                        key={review.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-6 flex flex-col gap-3"
                    >
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-slate-900 text-[13px]">{review.authorName}</span>
                                    {review.isVerified && (
                                        <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-emerald-700">
                                            <ShieldCheck className="h-3 w-3" /> Compra verificada
                                        </span>
                                    )}
                                </div>
                                <Link href={`/producto/${review.product.slug}`} target="_blank" className="text-[11px] text-primary/80 hover:underline">
                                    {review.product.name}
                                </Link>
                            </div>
                            <div className="flex items-center gap-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Star key={i} className={`h-3.5 w-3.5 ${i < review.rating ? "fill-yellow-400 text-yellow-700" : "text-slate-500"}`} />
                                ))}
                            </div>
                        </div>
                        <p className="text-slate-600 text-[13px] leading-relaxed">{review.comment}</p>
                        <div className="flex items-center justify-between">
                            <span className="text-slate-500 text-[10px]">
                                {new Date(review.createdAt).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" })}
                            </span>
                            <div className="flex items-center gap-2">
                                {review.isApproved ? (
                                    <button
                                        disabled={updating === review.id}
                                        onClick={() => setApproval(review.id, false)}
                                        className="px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-slate-50 text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50"
                                    >
                                        Ocultar
                                    </button>
                                ) : (
                                    <button
                                        disabled={updating === review.id}
                                        onClick={() => setApproval(review.id, true)}
                                        className="px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all disabled:opacity-50"
                                    >
                                        Publicar
                                    </button>
                                )}
                                <button
                                    disabled={updating === review.id}
                                    onClick={() => deleteReview(review.id)}
                                    className="p-1.5 rounded-full text-red-700/70 hover:bg-red-500/10 hover:text-red-700 transition-all disabled:opacity-50"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
