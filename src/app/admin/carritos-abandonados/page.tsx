"use client";

import { useState, useEffect } from "react";

import {
    ShoppingBag,
    User,
    Calendar,
    Filter,
    Search,
    Mail,
    Download,
    ChevronDown,
    Trash2,
    CheckCircle2,
    XCircle,
    Copy,
    ExternalLink
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function AbandonedCartsPage() {
    const [carts, setCarts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterType, setFilterType] = useState("all"); // all, registered, guest, anonymous
    const [minTotal, setMinTotal] = useState("");
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const fetchCarts = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (filterType !== "all") params.append("type", filterType);
            if (minTotal) params.append("minTotal", minTotal);

            const res = await fetch(`/api/admin/abandoned-carts?${params.toString()}`);
            const data = await res.json();
            setCarts(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching carts:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCarts();
    }, [filterType, minTotal]);

    const copyEmails = () => {
        const emails = carts
            .map(c => c.email || c.user?.email)
            .filter(Boolean)
            .join(", ");

        if (!emails) {
            setNotification({ message: "No hay correos para copiar", type: 'error' });
            return;
        }

        navigator.clipboard.writeText(emails);
        setNotification({ message: "Correos copiados al portapapeles", type: 'success' });
    };

    const deleteCart = async (id: string) => {
        if (!confirm("¿Estás seguro de eliminar este registro?")) return;

        try {
            const res = await fetch(`/api/admin/abandoned-carts?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                setCarts(carts.filter(c => c.id !== id));
                setNotification({ message: "Registro eliminado", type: 'success' });
            }
        } catch (error) {
            setNotification({ message: "Error al eliminar", type: 'error' });
        }
    };

    const getStatusLabel = (cart: any) => {
        if (cart.userId) return { label: "Registrado", class: "bg-blue-400/10 text-blue-400" };
        if (cart.email) return { label: "Invitado", class: "bg-purple-400/10 text-purple-400" };
        return { label: "Anónimo", class: "bg-white/5 text-white/40" };
    };

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    return (
        <>
            <div className="space-y-8 animate-in fade-in duration-700">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl font-light text-white font-montserrat tracking-tight">carritos abandonados</h1>
                        <p className="text-white/40 text-[11px] uppercase tracking-widest">seguimiento de ventas potenciales</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={copyEmails}
                            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl text-[11px] font-medium flex items-center gap-2 transition-all"
                        >
                            <Mail className="h-4 w-4" />
                            Copiar Emails
                        </button>
                        <button className="bg-white/5 hover:bg-white/10 text-white/70 px-4 py-2 rounded-xl text-[11px] font-medium flex items-center gap-2 transition-all border border-white/5">
                            <Download className="h-4 w-4" />
                            Exportar CSV
                        </button>
                    </div>
                </div>

                {/* Filtros */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 flex gap-4">
                        <div className="flex-1">
                            <p className="text-[10px] text-white/40 uppercase tracking-widest mb-2 font-bold">Tipo de Usuario</p>
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="w-full bg-transparent text-white text-[12px] border-none focus:ring-0 p-0"
                            >
                                <option value="all">Todos los tipos</option>
                                <option value="registered">Registrados</option>
                                <option value="guest">Invitados (con Email)</option>
                                <option value="anonymous">Anónimos</option>
                            </select>
                        </div>
                    </div>
                    <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 flex gap-4">
                        <div className="flex-1">
                            <p className="text-[10px] text-white/40 uppercase tracking-widest mb-2 font-bold">Precio Mínimo (AR$)</p>
                            <input
                                type="number"
                                placeholder="0"
                                value={minTotal}
                                onChange={(e) => setMinTotal(e.target.value)}
                                className="w-full bg-transparent text-white text-[12px] border-none focus:ring-0 p-0"
                            />
                        </div>
                    </div>
                    <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] text-primary uppercase tracking-widest font-bold">Total Capturado</p>
                            <p className="text-xl font-light text-white font-montserrat">$ {(Array.isArray(carts) ? carts : []).reduce((acc, c) => acc + (c.total || 0), 0).toLocaleString('es-AR')}</p>
                        </div>
                        <ShoppingBag className="text-primary h-8 w-8 opacity-50" />
                    </div>
                </div>

                {/* Tabla */}
                <div className="bg-white/[0.03] border border-white/5 rounded-3xl overflow-hidden backdrop-blur-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5">
                                    <th className="px-6 py-4 text-[10px] font-medium text-white/40 uppercase tracking-widest">Información de Contacto</th>
                                    <th className="px-6 py-4 text-[10px] font-medium text-white/40 uppercase tracking-widest">Última Actividad</th>
                                    <th className="px-6 py-4 text-[10px] font-medium text-white/40 uppercase tracking-widest">Productos</th>
                                    <th className="px-6 py-4 text-[10px] font-medium text-white/40 uppercase tracking-widest">Total</th>
                                    <th className="px-6 py-4 text-[10px] font-medium text-white/40 uppercase tracking-widest text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-white/20 text-[11px] uppercase tracking-widest animate-pulse">
                                            Cargando carritos abandonados...
                                        </td>
                                    </tr>
                                ) : carts.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-white/20 text-[11px] uppercase tracking-widest">
                                            No se encontraron carritos abandonados
                                        </td>
                                    </tr>
                                ) : (
                                    carts.map((cart) => {
                                        const status = getStatusLabel(cart);
                                        const displayName = cart.user ? `${cart.user.name} ${cart.user.lastName}` : (cart.name || "Usuario Anónimo");
                                        const displayEmail = cart.email || cart.user?.email || "-";
                                        const itemsCount = JSON.parse(cart.items || "[]").length;

                                        return (
                                            <tr key={cart.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                                                <td className="px-6 py-5">
                                                    <div className="flex flex-col gap-0.5">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[12px] text-white font-medium">{displayName}</span>
                                                            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-tighter ${status.class}`}>
                                                                {status.label}
                                                            </span>
                                                        </div>
                                                        <span className="text-[10px] text-white/40 lowercase">{displayEmail}</span>
                                                        {cart.phone && <span className="text-[10px] text-white/40">{cart.phone}</span>}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex flex-col">
                                                        <span className="text-[11px] text-white/60">
                                                            {format(new Date(cart.lastActive), "d 'de' MMMM", { locale: es })}
                                                        </span>
                                                        <span className="text-[10px] text-white/30 lowercase">
                                                            {format(new Date(cart.lastActive), "HH:mm 'hs'", { locale: es })}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-2">
                                                        <div className="p-2 rounded-xl bg-white/5 group-hover:bg-primary/20 transition-colors">
                                                            <ShoppingBag className="h-3.5 w-3.5 text-white/40 group-hover:text-primary transition-colors" />
                                                        </div>
                                                        <span className="text-[11px] text-white/70">{itemsCount} productos</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className="text-[12px] text-white font-medium font-montserrat">
                                                        $ {cart.total.toLocaleString('es-AR')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => deleteCart(cart.id)}
                                                            className="p-2 hover:bg-red-500/10 rounded-lg text-white/20 hover:text-red-400 transition-all"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Notificación (Toast) */}
                {notification && (
                    <div className={`fixed bottom-8 right-8 ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right duration-300 z-[100]`}>
                        {notification.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                        <span className="text-[11px] font-bold uppercase tracking-wider">{notification.message}</span>
                    </div>
                )}
            </div>
        </>
    );
}
