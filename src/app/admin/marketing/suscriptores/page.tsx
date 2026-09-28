"use client";

import { useState, useEffect } from "react";

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
        <>
            <div className="space-y-8 animate-in fade-in duration-700">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl font-light text-slate-900 font-montserrat tracking-tight">suscriptores</h1>
                        <p className="text-slate-600 text-[11px] uppercase tracking-widest">gestión de audiencia y newsletter</p>
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
                    <div className="bg-white border border-slate-200 rounded-3xl p-6">
                        <p className="text-slate-600 text-[10px] uppercase tracking-widest mb-1">Total de Suscriptores</p>
                        <p className="text-3xl font-light text-slate-900 font-montserrat">{subscribers.length}</p>
                    </div>

                    <div className="md:col-span-2 bg-white border border-slate-200 rounded-3xl p-4 flex items-center px-6">
                        <Search className="h-5 w-5 text-slate-500 mr-4" />
                        <input
                            type="text"
                            placeholder="Buscar por email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-transparent border-none text-slate-900 text-sm w-full focus:outline-none placeholder:text-slate-500"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50">
                                    <th className="px-8 py-5 text-[10px] uppercase tracking-widest text-slate-600 font-medium italic">Email de Contacto</th>
                                    <th className="px-8 py-5 text-[10px] uppercase tracking-widest text-slate-600 font-medium italic text-center">Estado</th>
                                    <th className="px-8 py-5 text-[10px] uppercase tracking-widest text-slate-600 font-medium italic text-right">Fecha de Alta</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={3} className="px-8 py-20 text-center">
                                            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                                            <p className="text-[11px] text-slate-500 uppercase tracking-widest">Cargando base de datos...</p>
                                        </td>
                                    </tr>
                                ) : filteredSubscribers.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-8 py-20 text-center">
                                            <Mail className="h-10 w-10 text-slate-500 mx-auto mb-4" />
                                            <p className="text-[11px] text-slate-500 uppercase tracking-widest">No se encontraron suscriptores</p>
                                        </td>
                                    </tr>
                                ) : filteredSubscribers.map((s) => (
                                    <tr key={s.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-8 py-5 flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-200 group-hover:border-primary/30 transition-colors">
                                                <Mail className="h-4 w-4 text-slate-600 group-hover:text-primary transition-colors" />
                                            </div>
                                            <span className="text-[14px] text-slate-900 group-hover:text-slate-900 transition-colors">{s.email}</span>
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            {s.isActive ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-700 text-[10px] font-bold uppercase tracking-widest border border-green-500/20">
                                                    <CheckCircle2 className="h-3 w-3" /> activo
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-700 text-[10px] font-bold uppercase tracking-widest border border-red-500/20">
                                                    <XCircle className="h-3 w-3" /> inactivo
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex flex-col items-end">
                                                <span className="text-[13px] text-slate-600 font-mono">
                                                    {new Date(s.createdAt).toLocaleDateString('es-AR')}
                                                </span>
                                                <span className="text-[9px] text-slate-500 uppercase tracking-tighter">
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
        </>
    );
}
