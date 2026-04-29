"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useAdminUtils } from "@/components/admin/AdminUtilsProvider";
import { Phone, Clock, CheckCircle, MessageCircle, Loader2, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminContactosPage() {
    const { user } = useAuthStore();
    const { showToast } = useAdminUtils();
    const [contacts, setContacts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);

    const fetchContacts = async () => {
        if (!user?.id) return;
        try {
            const res = await fetch(`/api/contacts?adminId=${user.id}`);
            const data = await res.json();
            if (data.contacts) setContacts(data.contacts);
        } catch {
            showToast("Error al cargar contactos", "error");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchContacts();
    }, [user?.id]);

    const markContacted = async (id: string) => {
        setUpdating(id);
        try {
            const res = await fetch("/api/contacts", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, status: "CONTACTED", adminId: user?.id }),
            });
            if (res.ok) {
                setContacts(prev => prev.map(c => c.id === id ? { ...c, status: "CONTACTED" } : c));
                showToast("Marcado como contactado");
            }
        } catch {
            showToast("Error al actualizar", "error");
        } finally {
            setUpdating(null);
        }
    };

    const openWhatsApp = (phone: string, name: string) => {
        const clean = phone.replace(/\D/g, "");
        const number = clean.startsWith("54") ? clean : `54${clean}`;
        const msg = encodeURIComponent(`¡Hola ${name}! Te contactamos desde Araí Yerba Mate 🌿`);
        window.open(`https://wa.me/${number}?text=${msg}`, "_blank");
    };

    const pending = contacts.filter(c => c.status === "PENDING");
    const contacted = contacts.filter(c => c.status === "CONTACTED");

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-20">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-light text-white font-montserrat tracking-tight">contactos</h1>
                <p className="text-white/40 text-[11px] uppercase tracking-widest">leads del chat · contactar por whatsapp</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-3xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <Clock className="h-4 w-4 text-orange-400" />
                        <span className="text-[10px] uppercase tracking-widest font-bold text-orange-400">Pendientes</span>
                    </div>
                    <p className="text-3xl font-light font-montserrat text-white">{pending.length}</p>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <CheckCircle className="h-4 w-4 text-emerald-400" />
                        <span className="text-[10px] uppercase tracking-widest font-bold text-emerald-400">Contactados</span>
                    </div>
                    <p className="text-3xl font-light font-montserrat text-white">{contacted.length}</p>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/[0.02]">
                                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-medium">Nombre</th>
                                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-medium">Teléfono</th>
                                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-medium">Fecha</th>
                                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-medium text-center">Estado</th>
                                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-medium text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-[13px]">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-white/20 text-[11px] uppercase tracking-widest">
                                        Cargando contactos...
                                    </td>
                                </tr>
                            ) : contacts.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-24 text-center">
                                        <MessageCircle className="h-8 w-8 text-white/5 mx-auto mb-4" />
                                        <p className="text-white/20 text-[11px] uppercase tracking-widest">
                                            Aún no hay solicitudes de contacto.
                                        </p>
                                    </td>
                                </tr>
                            ) : contacts.map((contact) => (
                                <motion.tr
                                    key={contact.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="hover:bg-white/[0.03] transition-all"
                                >
                                    <td className="px-6 py-5">
                                        <span className="font-medium text-white">{contact.name}</span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="text-white/60 font-mono text-[12px]">{contact.phone}</span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="text-white/40 text-[11px]">
                                            {new Date(contact.createdAt).toLocaleDateString("es-AR", {
                                                day: "2-digit", month: "2-digit", year: "numeric",
                                                hour: "2-digit", minute: "2-digit"
                                            })}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        {contact.status === "PENDING" ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-orange-500/10 border border-orange-500/20 text-orange-400">
                                                <Clock className="h-2.5 w-2.5" />
                                                Pendiente
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                                                <CheckCircle className="h-2.5 w-2.5" />
                                                Contactado
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => openWhatsApp(contact.phone, contact.name)}
                                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/20 text-[#25D366] text-[10px] font-bold uppercase tracking-widest transition-all"
                                            >
                                                <ExternalLink className="h-3 w-3" />
                                                WhatsApp
                                            </button>
                                            {contact.status === "PENDING" && (
                                                <button
                                                    onClick={() => markContacted(contact.id)}
                                                    disabled={updating === contact.id}
                                                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest transition-all disabled:opacity-40"
                                                >
                                                    {updating === contact.id ? (
                                                        <Loader2 className="h-3 w-3 animate-spin" />
                                                    ) : (
                                                        <CheckCircle className="h-3 w-3" />
                                                    )}
                                                    Marcar
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
