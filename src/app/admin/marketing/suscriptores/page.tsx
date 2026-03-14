"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import {
    Download,
    Search,
    Calendar,
    Mail,
    CheckCircle2,
    XCircle,
    Loader2,
    Filter,
    ArrowUpDown
} from "lucide-react";

interface Subscriber {
    id: string;
    email: string;
    isActive: boolean;
    createdAt: string;
}

export default function SubscribersPage() {
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isExporting, setIsExporting] = useState(false);

    useEffect(() => {
        fetchSubscribers();
    }, []);

    const fetchSubscribers = async () => {
        try {
            const res = await fetch("/api/admin/newsletter/subscribers");
            const data = await res.json();
            if (Array.isArray(data)) {
                setSubscribers(data);
            }
        } catch (error) {
            console.error("Error fetching subscribers:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const response = await fetch("/api/admin/newsletter/export");
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `suscriptores-arai-${new Date().toISOString().split('T')[0]}.csv`;
                document.body.appendChild(a);
                a.click();
                a.remove();
            }
        } catch (error) {
            console.error("Error exporting:", error);
        } finally {
            setIsExporting(false);
        }
    };

    const filteredSubscribers = subscribers.filter(s =>
        s.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout>
            <div className="space-y-8 animate-in fade-in duration-700">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl font-light text-white font-montserrat tracking-tight">suscriptores</h1>
                        <p className="text-white/40 text-[11px] uppercase tracking-widest">gestión de audiencia y newsletter</p>
                    </div>

                    <button
                        onClick={handleExport}
                        disabled={isExporting}
                        className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl text-[12px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50"
                    >
                        {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                        exportar lista (csv)
                    </button>
                </div>

                {/* Filters & Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-6">
                        <p className="text-white/40 text-[10px] uppercase tracking-widest mb-1">Total de Suscriptores</p>
                        <p className="text-3xl font-light text-white font-montserrat">{subscribers.length}</p>
                    </div>

                    <div className="md:col-span-2 bg-white/[0.03] border border-white/5 rounded-3xl p-4 flex items-center px-6">
                        <Search className="h-5 w-5 text-white/20 mr-4" />
                        <input
                            type="text"
                            placeholder="Buscar por email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-transparent border-none text-white text-sm w-full focus:outline-none placeholder:text-white/20"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/[0.04]">
                                    <th className="px-8 py-5 text-[10px] uppercase tracking-widest text-white/40 font-medium italic">Email de Contacto</th>
                                    <th className="px-8 py-5 text-[10px] uppercase tracking-widest text-white/40 font-medium italic text-center">Estado</th>
                                    <th className="px-8 py-5 text-[10px] uppercase tracking-widest text-white/40 font-medium italic text-right">Fecha de Alta</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={3} className="px-8 py-20 text-center">
                                            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                                            <p className="text-[11px] text-white/20 uppercase tracking-widest">Cargando base de datos...</p>
                                        </td>
                                    </tr>
                                ) : filteredSubscribers.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-8 py-20 text-center">
                                            <Mail className="h-10 w-10 text-white/10 mx-auto mb-4" />
                                            <p className="text-[11px] text-white/20 uppercase tracking-widest">No se encontraron suscriptores</p>
                                        </td>
                                    </tr>
                                ) : filteredSubscribers.map((s) => (
                                    <tr key={s.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-8 py-5 flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-primary/30 transition-colors">
                                                <Mail className="h-4 w-4 text-white/40 group-hover:text-primary transition-colors" />
                                            </div>
                                            <span className="text-[14px] text-white/80 group-hover:text-white transition-colors">{s.email}</span>
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            {s.isActive ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-[10px] font-bold uppercase tracking-widest border border-green-500/20">
                                                    <CheckCircle2 className="h-3 w-3" /> activo
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-[10px] font-bold uppercase tracking-widest border border-red-500/20">
                                                    <XCircle className="h-3 w-3" /> inactivo
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex flex-col items-end">
                                                <span className="text-[13px] text-white/60 font-mono">
                                                    {new Date(s.createdAt).toLocaleDateString('es-AR')}
                                                </span>
                                                <span className="text-[9px] text-white/20 uppercase tracking-tighter">
                                                    {new Date(s.createdAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} hs
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
