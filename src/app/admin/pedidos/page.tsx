"use client";

import { AdminLayout } from "@/components/admin/AdminLayout";
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
    Loader2
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
        switch (status.toLowerCase()) {
            case 'pending':
            case 'pendiente':
                return { bg: 'bg-orange-500/10', border: 'border-orange-500/20', text: 'text-orange-400', icon: Clock };
            case 'processing':
            case 'procesando':
                return { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', icon: Package };
            case 'shipped':
            case 'enviado':
                return { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400', icon: Truck };
            case 'completed':
            case 'completado':
                return { bg: 'bg-green-500/10', border: 'border-green-500/20', text: 'text-green-400', icon: CheckCircle };
            default:
                return { bg: 'bg-gray-500/10', border: 'border-gray-500/20', text: 'text-gray-400', icon: Clock };
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-8 animate-in fade-in duration-700">
                {/* Header */}
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-light text-white font-montserrat tracking-tight">pedidos</h1>
                    <p className="text-white/40 text-[11px] uppercase tracking-widest">gestiona las ventas de tu tienda</p>
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
                                        ) : orders.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-12 text-center text-white/20 text-[11px] uppercase tracking-widest">
                                                    No hay pedidos registrados.
                                                </td>
                                            </tr>
                                        ) : orders.map((order) => {
                                            const status = getStatusStyles(order.status);
                                            const StatusIcon = status.icon;

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
                                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border ${status.bg} ${status.border} ${status.text}`}>
                                                            <StatusIcon className="h-3 w-3" />
                                                            {order.status}
                                                        </span>
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
                                                        <a
                                                            href={selectedOrder.paymentProof}
                                                            target="_blank"
                                                            className="mt-3 flex items-center gap-2 text-[10px] font-bold text-white bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-all"
                                                        >
                                                            <FileText className="h-3 w-3" />
                                                            VER COMPROBANTE
                                                            <ExternalLink className="h-3 w-3 ml-auto opacity-40" />
                                                        </a>
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
                                                {['Pending', 'Processing', 'Shipped', 'Completed'].map((s) => (
                                                    <button
                                                        key={s}
                                                        disabled={statusUpdating === selectedOrder.id || selectedOrder.status === s}
                                                        onClick={() => updateStatus(selectedOrder.id, s)}
                                                        className={`px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${selectedOrder.status === s
                                                                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                                                : 'bg-white/5 text-white/40 hover:bg-white/10'
                                                            }`}
                                                    >
                                                        {statusUpdating === selectedOrder.id && selectedOrder.status === s ? <Loader2 className="h-3 w-3 animate-spin mx-auto" /> : s}
                                                    </button>
                                                ))}
                                            </div>
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

                {/* Footer stats helper */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                    <div className="p-6 bg-white/[0.03] border border-white/5 rounded-3xl group hover:bg-white/[0.05] transition-all">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-orange-500/10 rounded-xl">
                                <Clock className="h-4 w-4 text-orange-400" />
                            </div>
                            <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Sin Procesar</span>
                        </div>
                        <p className="text-2xl font-light text-white font-montserrat">
                            {orders.filter(o => o.status === 'Pending').length}
                        </p>
                    </div>
                    <div className="p-6 bg-white/[0.03] border border-white/5 rounded-3xl group hover:bg-white/[0.05] transition-all">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-purple-500/10 rounded-xl">
                                <Truck className="h-4 w-4 text-purple-400" />
                            </div>
                            <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">En Camino</span>
                        </div>
                        <p className="text-2xl font-light text-white font-montserrat">
                            {orders.filter(o => o.status === 'Shipped').length}
                        </p>
                    </div>
                    <div className="p-6 bg-white/[0.03] border border-white/5 rounded-3xl group hover:bg-white/[0.05] transition-all">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-green-500/10 rounded-xl">
                                <CheckCircle className="h-4 w-4 text-green-400" />
                            </div>
                            <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Completados</span>
                        </div>
                        <p className="text-2xl font-light text-white font-montserrat">
                            {orders.filter(o => o.status === 'Completed').length}
                        </p>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
