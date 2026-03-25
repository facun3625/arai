"use client";


import {
    ShoppingCart,
    Search,
    Eye,
    CheckCircle,
    Package,
    Truck,
    Clock,
    Filter,
    ArrowUpRight,
    FileText,
    ExternalLink,
    Loader2,
    ChevronDown,
    X,
    Trash2
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminPedidosPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuthStore();
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [statusUpdating, setStatusUpdating] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [showProofModal, setShowProofModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const ITEMS_PER_PAGE = 20;

    const handleDeleteOrder = async (orderId: string) => {
        if (!confirm("¿Estás seguro de que deseas eliminar este pedido? Esta acción no se puede deshacer.")) return;
        
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/admin/orders?id=${orderId}&adminId=${user?.id}`, {
                method: "DELETE"
            });

            if (res.ok) {
                setOrders(prev => prev.filter(o => o.id !== orderId));
                setSelectedOrder(null);
                // Notify sidebar to refresh badges
                window.dispatchEvent(new CustomEvent('refreshAdminStats'));
            } else {
                const data = await res.json();
                alert(data.error || "Error al eliminar pedido");
            }
        } catch (error) {
            alert("Error de conexión");
        } finally {
            setIsDeleting(false);
        }
    };

    const STATUS_MAP: Record<string, string> = {
        'PENDING': 'Pendiente',
        'PAID': 'Pagado',
        'PROCESSING': 'Procesando',
        'SHIPPED': 'Enviado',
        'COMPLETED': 'Completado',
        'CANCELLED': 'Cancelado'
    };

    const fetchOrders = async () => {
        if (!user?.id) return;
        try {
            const res = await fetch(`/api/admin/orders?adminId=${user.id}`);
            const data = await res.json();
            if (data.orders) {
                setOrders(data.orders);
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [user?.id]);

    // Scroll to top when an order is selected (useful for mobile)
    useEffect(() => {
        if (selectedOrder) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [selectedOrder]);

    const updateStatus = async (orderId: string, newStatus: string) => {
        setStatusUpdating(orderId);
        try {
            const res = await fetch("/api/admin/orders", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId, status: newStatus, adminId: user?.id })
            });

            if (res.ok) {
                fetchOrders();
                // Notify sidebar to refresh badges
                window.dispatchEvent(new CustomEvent('refreshAdminStats'));

                if (selectedOrder?.id === orderId) {
                    setSelectedOrder({ ...selectedOrder, status: newStatus });
                }
            }
        } catch (error) {
            console.error("Error updating status:", error);
        } finally {
            setStatusUpdating(null);
        }
    };

    const getStatusStyles = (status: string) => {
        const s = status.toUpperCase();
        switch (s) {
            case 'PENDING':
                return { bg: 'bg-orange-500/10', border: 'border-orange-500/20', text: 'text-orange-400', icon: Clock, label: 'Pendiente' };
            case 'PAID':
                return { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', icon: CheckCircle, label: 'Pagado' };
            case 'PROCESSING':
                return { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', icon: Package, label: 'Procesando' };
            case 'SHIPPED':
                return { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400', icon: Truck, label: 'Enviado' };
            case 'COMPLETED':
                return { bg: 'bg-green-500/10', border: 'border-green-500/20', text: 'text-green-400', icon: CheckCircle, label: 'Completado' };
            case 'CANCELLED':
                return { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400', icon: Clock, label: 'Cancelado' };
            default:
                // Fallback for older orders that might still have spanish text
                if (status.toLowerCase().includes('pend')) return { bg: 'bg-orange-500/10', border: 'border-orange-500/20', text: 'text-orange-400', icon: Clock, label: 'Pendiente' };
                if (status.toLowerCase().includes('proc')) return { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', icon: Package, label: 'Procesando' };
                if (status.toLowerCase().includes('env')) return { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400', icon: Truck, label: 'Enviado' };
                if (status.toLowerCase().includes('comp') || status.toLowerCase().includes('ent')) return { bg: 'bg-green-500/10', border: 'border-green-500/20', text: 'text-green-400', icon: CheckCircle, label: 'Completado' };
                return { bg: 'bg-gray-500/10', border: 'border-gray-500/20', text: 'text-gray-400', icon: Clock, label: status };
        }
    };

    const [filterStatus, setFilterStatus] = useState<string | null>(null);

    const filteredOrders = filterStatus
        ? orders.filter(o => o.status.toLowerCase() === filterStatus.toLowerCase())
        : orders;

    // Reset pagination when filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [filterStatus]);

    const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
    const paginatedOrders = filteredOrders.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const StatsCard = ({ label, count, statusKey, icon: Icon, colorClass, bgColor }: any) => {
        const isActive = filterStatus === statusKey;

        return (
            <button
                onClick={() => {
                    setFilterStatus(isActive ? null : statusKey);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`p-6 border rounded-3xl group transition-all text-left flex flex-col justify-between h-full relative overflow-hidden ${isActive
                    ? `${colorClass} ${bgColor} border-current shadow-lg ring-1 ring-current/30`
                    : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.05] hover:border-white/10'
                    }`}
            >
                <div className="flex items-center gap-3 mb-4 relative z-10">
                    <div className={`p-2 rounded-xl ${isActive ? 'bg-white/20' : bgColor}`}>
                        <Icon className={`h-4 w-4 ${isActive ? 'text-white' : colorClass.replace('border-', 'text-')}`} />
                    </div>
                    <span className={`text-[10px] uppercase tracking-widest font-bold ${isActive ? 'text-white' : 'text-white/40'}`}>
                        {label}
                    </span>
                </div>
                <div className="relative z-10">
                    <div className="flex items-end justify-between">
                        <p className={`text-3xl font-light font-montserrat ${isActive ? 'text-white' : 'text-white'}`}>
                            {count}
                        </p>
                        {!isActive ? (
                            <span className="text-[9px] uppercase tracking-widest font-bold text-white/20 group-hover:text-primary transition-colors flex items-center gap-1">
                                Filtrar <ArrowUpRight className="h-2.5 w-2.5" />
                            </span>
                        ) : (
                            <span className="text-[9px] uppercase tracking-widest font-bold text-white/60 flex items-center gap-1">
                                Activo <div className="h-1.5 w-1.5 bg-white rounded-full animate-pulse" />
                            </span>
                        )}
                    </div>
                </div>

                {/* Decorative background element for active state */}
                {isActive && (
                    <div className="absolute -right-4 -bottom-4 opacity-10">
                        <Icon size={80} />
                    </div>
                )}
            </button>
        );
    };

    return (
        <>
            <div className="space-y-8 animate-in fade-in duration-700 pb-20">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-light text-white font-montserrat tracking-tight">pedidos</h1>
                            {filterStatus && (
                                <div className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border ${getStatusStyles(filterStatus).bg} ${getStatusStyles(filterStatus).text} ${getStatusStyles(filterStatus).border}`}>
                                    Filtrando: {STATUS_MAP[Object.keys(STATUS_MAP).find(k => k.toLowerCase() === filterStatus.toLowerCase()) || ''] || filterStatus}
                                </div>
                            )}
                        </div>
                        <p className="text-white/40 text-[11px] uppercase tracking-widest">
                            {filterStatus ? 'Explorando segmento seleccionado' : 'gestiona las ventas de tu tienda'}
                        </p>
                    </div>
                    {filterStatus && (
                        <button
                            onClick={() => setFilterStatus(null)}
                            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white px-4 py-2 rounded-xl transition-all border border-white/5 text-[10px] uppercase tracking-widest font-bold group"
                        >
                            <div className="h-1.5 w-1.5 bg-red-500 rounded-full group-hover:animate-ping" />
                            Quitar Filtro
                        </button>
                    )}
                </div>

                {/* Stats at the top */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
                    <StatsCard
                        label="Pendientes"
                        count={orders.filter(o => o.status === 'PENDING').length}
                        statusKey="PENDING"
                        icon={Clock}
                        colorClass="text-orange-400 border-orange-500/20"
                        bgColor="bg-orange-500/10"
                    />
                    <StatsCard
                        label="Procesando"
                        count={orders.filter(o => o.status === 'PROCESSING').length}
                        statusKey="PROCESSING"
                        icon={Package}
                        colorClass="text-blue-400 border-blue-500/20"
                        bgColor="bg-blue-500/10"
                    />
                    <StatsCard
                        label="Enviados"
                        count={orders.filter(o => o.status === 'SHIPPED').length}
                        statusKey="SHIPPED"
                        icon={Truck}
                        colorClass="text-purple-400 border-purple-500/20"
                        bgColor="bg-purple-500/10"
                    />
                    <StatsCard
                        label="Completados"
                        count={orders.filter(o => o.status === 'COMPLETED').length}
                        statusKey="COMPLETED"
                        icon={CheckCircle}
                        colorClass="text-green-400 border-green-500/20"
                        bgColor="bg-green-500/10"
                    />
                    <StatsCard
                        label="Cancelados"
                        count={orders.filter(o => o.status === 'CANCELLED').length}
                        statusKey="CANCELLED"
                        icon={Clock}
                        colorClass="text-red-400 border-red-500/20"
                        bgColor="bg-red-500/10"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* List section */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                            <div className="relative w-full">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                                <input
                                    type="text"
                                    placeholder="Buscar por cliente o ID..."
                                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl pl-11 pr-4 py-3 text-[13px] text-white focus:outline-none focus:border-primary transition-colors"
                                />
                            </div>
                        </div>

                        <div className="bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-white/5 bg-white/[0.02]">
                                            <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-medium whitespace-nowrap">ID / Fecha</th>
                                            <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-medium">Cliente</th>
                                            <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-medium">Total</th>
                                            <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-medium text-center">Estado</th>
                                            <th className="px-6 py-4 text-right"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5 text-[13px]">
                                        {isLoading ? (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-12 text-center text-white/20 text-[11px] uppercase tracking-widest">
                                                    Cargando pedidos...
                                                </td>
                                            </tr>
                                        ) : paginatedOrders.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-24 text-center">
                                                    <ShoppingCart className="h-8 w-8 text-white/5 mx-auto mb-4" />
                                                    <p className="text-white/20 text-[11px] uppercase tracking-widest">
                                                        No hay pedidos {filterStatus ? 'con este estado' : 'registrados'}.
                                                    </p>
                                                    {filterStatus && (
                                                        <button
                                                            onClick={() => setFilterStatus(null)}
                                                            className="mt-4 text-[10px] uppercase tracking-widest text-primary font-bold hover:underline"
                                                        >
                                                            Limpiar Filtro
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ) : paginatedOrders.map((order) => {
                                            const status = getStatusStyles(order.status);

                                            return (
                                                <tr
                                                    key={order.id}
                                                    className={`hover:bg-white/[0.03] transition-all cursor-pointer group ${selectedOrder?.id === order.id ? 'bg-white/[0.04]' : ''}`}
                                                    onClick={() => setSelectedOrder(order)}
                                                >
                                                    <td className="px-6 py-5">
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className="text-[11px] font-mono text-white/40">#{order.id.slice(-6).toUpperCase()}</span>
                                                            <span className="text-white/60 text-[11px]">
                                                                {new Date(order.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className="font-medium text-white group-hover:text-primary transition-colors">
                                                                {order.contactName} {order.contactLastName}
                                                            </span>
                                                            <span className="text-[11px] text-white/20">{order.contactEmail}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5 font-medium text-white">
                                                        $ {order.total.toLocaleString('es-AR')}
                                                    </td>
                                                    <td className="px-6 py-5 text-center">
                                                        <div className="relative group/status inline-block" onClick={(e) => e.stopPropagation()}>
                                                            <select
                                                                value={order.status}
                                                                disabled={statusUpdating === order.id}
                                                                onChange={(e) => updateStatus(order.id, e.target.value)}
                                                                className={`appearance-none inline-flex items-center gap-1.5 pl-3 pr-8 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border cursor-pointer hover:bg-white/5 transition-colors focus:outline-none ${status.bg} ${status.border} ${status.text}`}
                                                            >
                                                                {Object.entries(STATUS_MAP).map(([val, label]) => (
                                                                    <option key={val} value={val} className="bg-[#0c120e] text-white">
                                                                        {label}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                            {statusUpdating === order.id ? (
                                                                <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 animate-spin text-primary" />
                                                            ) : (
                                                                <ChevronDown className={`absolute right-2.5 top-1/2 -translate-y-1/2 h-2.5 w-2.5 ${status.text} opacity-40 group-hover/status:opacity-100 transition-opacity pointer-events-none`} />
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5 text-right">
                                                        <div className={`p-2 rounded-lg transition-all ${selectedOrder?.id === order.id ? 'text-primary' : 'text-white/20 group-hover:text-white'}`}>
                                                            <Eye className="h-4 w-4" />
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between px-2 pt-4">
                                <p className="text-[11px] text-white/20 uppercase tracking-widest">
                                    Página {currentPage} de {totalPages} ({filteredOrders.length} pedidos)
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        disabled={currentPage === 1}
                                        onClick={() => {
                                            setCurrentPage(prev => prev - 1);
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                        className="p-2 rounded-xl bg-white/5 border border-white/5 text-white/40 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 transition-all outline-none"
                                    >
                                        <ChevronDown className="h-4 w-4 rotate-90" />
                                    </button>
                                    <div className="flex items-center gap-1">
                                        {[...Array(totalPages)].map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => {
                                                    setCurrentPage(i + 1);
                                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                                }}
                                                className={`w-8 h-8 rounded-xl text-[10px] font-bold transition-all outline-none ${currentPage === i + 1
                                                    ? 'bg-primary text-white'
                                                    : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'
                                                    }`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        disabled={currentPage === totalPages}
                                        onClick={() => {
                                            setCurrentPage(prev => prev + 1);
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                        className="p-2 rounded-xl bg-white/5 border border-white/5 text-white/40 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 transition-all outline-none"
                                    >
                                        <ChevronDown className="h-4 w-4 -rotate-90" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Detail section */}
                    <div className="relative">
                        <div className="sticky top-8 space-y-6">
                            <AnimatePresence mode="wait">
                                {selectedOrder ? (
                                    <motion.div
                                        key={selectedOrder.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="bg-white/[0.03] border border-white/5 rounded-[40px] overflow-hidden p-8"
                                    >
                                        <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
                                            <div>
                                                <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1">pedido</p>
                                                <h3 className="text-xl font-light text-white font-montserrat">#{selectedOrder.id.slice(-6).toUpperCase()}</h3>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1">pago</p>
                                                <span className="text-[11px] text-white/80 uppercase tracking-widest font-mono">{selectedOrder.paymentMethod}</span>
                                            </div>
                                        </div>

                                        <div className="space-y-6 mb-8">
                                            {selectedOrder.status.toLowerCase() === 'pending' && selectedOrder.paymentMethod === 'transferencia' && (
                                                <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <Clock className="h-4 w-4 text-orange-400" />
                                                        <p className="text-[11px] font-bold text-orange-400 uppercase tracking-widest">Validar Pago</p>
                                                    </div>
                                                    <p className="text-[10px] text-white/60 leading-relaxed">
                                                        Este pedido está pendiente de validación por transferencia bancaria.
                                                        Verifica el comprobante antes de procesar.
                                                    </p>
                                                    {selectedOrder.paymentProof ? (
                                                        <button
                                                            onClick={() => setShowProofModal(true)}
                                                            className="mt-3 w-full flex items-center justify-center gap-2 text-[10px] font-bold text-white bg-primary hover:bg-primary-dark p-3 rounded-xl transition-all shadow-lg shadow-primary/20"
                                                        >
                                                            <Eye className="h-3 w-3" />
                                                            VER COMPROBANTE
                                                            <ExternalLink className="h-3 w-3 ml-auto opacity-40" />
                                                        </button>
                                                    ) : (
                                                        <div className="mt-3 px-2 py-1 bg-white/5 rounded-md text-[9px] text-white/30 italic">
                                                            Comprobante no adjuntado aún
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            <div className="space-y-4">
                                                <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Resumen de Productos</p>
                                                <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                                    {selectedOrder.items.map((item: any) => (
                                                        <div key={item.id} className="flex justify-between items-center gap-4 text-[12px]">
                                                            <span className="text-white/80">{item.quantity}x {item.name}</span>
                                                            <span className="text-white font-medium">$ {item.price.toLocaleString('es-AR')}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="pt-4 border-t border-white/5 space-y-2">
                                                    <div className="flex justify-between text-[11px] text-white/40">
                                                        <span>Subtotal</span>
                                                        <span>$ {selectedOrder.subtotal.toLocaleString('es-AR')}</span>
                                                    </div>
                                                    <div className="flex justify-between text-[11px] text-white/40">
                                                        <span>Envío</span>
                                                        <span>$ {selectedOrder.shippingCost.toLocaleString('es-AR')}</span>
                                                    </div>
                                                    <div className="flex justify-between text-[13px] text-white font-bold pt-2">
                                                        <span>Total</span>
                                                        <span className="text-primary">$ {selectedOrder.total.toLocaleString('es-AR')}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Datos de Envío</p>
                                                <div className="bg-white/5 p-4 rounded-2xl space-y-2 text-[11px]">
                                                    <p className="text-white font-medium capitalize">{selectedOrder.shippingAddress.street} {selectedOrder.shippingAddress.number}</p>
                                                    <p className="text-white/40">{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.province}</p>
                                                    <p className="text-white/40">CP: {selectedOrder.shippingAddress.zipCode}</p>
                                                    <p className="text-white/40 mt-2 border-t border-white/5 pt-2">DNI: {selectedOrder.contactDni}</p>
                                                    <p className="text-white/40">TEL: {selectedOrder.contactPhone}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Cambiar Estado</p>
                                            <div className="grid grid-cols-2 gap-2">
                                                {Object.entries(STATUS_MAP).map(([val, label]) => (
                                                    <button
                                                        key={val}
                                                        disabled={statusUpdating === selectedOrder.id || selectedOrder.status === val}
                                                        onClick={() => updateStatus(selectedOrder.id, val)}
                                                        className={`px-3 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${selectedOrder.status === val
                                                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                                            : 'bg-white/5 text-white/40 hover:bg-white/10'
                                                            }`}
                                                    >
                                                        {statusUpdating === selectedOrder.id && selectedOrder.status === val ? (
                                                            <Loader2 className="h-3 w-3 animate-spin mx-auto" />
                                                        ) : (
                                                            label
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="pt-8 mt-8 border-t border-white/5">
                                            <button
                                                onClick={() => handleDeleteOrder(selectedOrder.id)}
                                                disabled={isDeleting}
                                                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all border border-red-500/20 group"
                                            >
                                                {isDeleting ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <>
                                                        <Trash2 className="h-4 w-4 opacity-40 group-hover:opacity-100 transition-opacity" />
                                                        ELIMINAR PEDIDO
                                                    </>
                                                )}
                                            </button>
                                            <p className="text-[9px] text-white/20 text-center mt-3 uppercase tracking-widest font-medium">
                                                esta acción eliminará permanentemente el registro
                                            </p>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <div className="h-[600px] border border-dashed border-white/10 rounded-[40px] flex flex-col items-center justify-center p-8 text-center bg-white/[0.01]">
                                        <div className="p-4 bg-white/5 rounded-full mb-4">
                                            <ShoppingCart className="h-8 w-8 text-white/10" />
                                        </div>
                                        <h4 className="text-white/40 font-montserrat font-light text-lg mb-2">Selecciona un pedido</h4>
                                        <p className="text-[11px] text-white/20 uppercase tracking-[0.2em] leading-relaxed">
                                            Haz clic en la lista para ver todos los detalles y gestionar su estado.
                                        </p>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Proof Modal */}
                <AnimatePresence>
                    {showProofModal && selectedOrder?.paymentProof && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
                        >
                            {/* Backdrop */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowProofModal(false)}
                                className="absolute inset-0 bg-black/90 backdrop-blur-xl"
                            />

                            {/* Content */}
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                className="relative bg-[#111] border border-white/10 rounded-[32px] overflow-hidden max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl"
                            >
                                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                                    <div>
                                        <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1">Comprobante de Pago</p>
                                        <h3 className="text-white font-medium">Pedido #{selectedOrder.id.slice(-6).toUpperCase()}</h3>
                                    </div>
                                    <button
                                        onClick={() => setShowProofModal(false)}
                                        className="h-10 w-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all border border-white/5"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4 md:p-8 flex items-center justify-center bg-black/20">
                                    <img
                                        src={selectedOrder.paymentProof}
                                        alt="Comprobante de transferencia"
                                        className="max-w-full h-auto rounded-2xl shadow-2xl"
                                    />
                                </div>
                                <div className="p-6 border-t border-white/5 flex justify-end bg-white/[0.02]">
                                    <a
                                        href={selectedOrder.paymentProof}
                                        target="_blank"
                                        className="flex items-center gap-2 text-[11px] font-bold text-white bg-white/5 hover:bg-white/10 px-6 py-3 rounded-xl transition-all border border-white/5 uppercase tracking-widest"
                                    >
                                        <ExternalLink className="h-3.5 w-3.5" />
                                        Abrir original
                                    </a>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
}
