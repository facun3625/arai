"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { ShoppingBag, Package, Clock, ChevronRight } from "lucide-react";
import Link from "next/link";

interface OrderItem {
    id: string;
    name: string;
    quantity: number;
    price: number;
    image: string | null;
}

interface Order {
    id: string;
    status: string;
    total: number;
    createdAt: string;
    items: OrderItem[];
}

export default function PedidosPage() {
    const { user } = useAuthStore();
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user?.id) {
            fetch(`/api/user/orders?userId=${user.id}`)
                .then(res => res.json())
                .then(data => {
                    if (data.orders) setOrders(data.orders);
                })
                .catch(err => console.error(err))
                .finally(() => setIsLoading(false));
        } else {
            setIsLoading(false);
        }
    }, [user?.id]);

    const getStatusStyles = (status: string) => {
        if (!status) return { bg: 'bg-gray-100 text-gray-600 border-gray-200', label: 'Sin Estado' };

        const s = status.toLowerCase();
        switch (s) {
            case 'pending':
            case 'pendiente':
                return { bg: 'bg-orange-100 text-orange-700 border-orange-200', label: 'Pendiente' };
            case 'processing':
            case 'procesando':
                return { bg: 'bg-blue-100 text-blue-700 border-blue-200', label: 'Procesando' };
            case 'shipped':
            case 'enviado':
                return { bg: 'bg-purple-100 text-purple-700 border-purple-200', label: 'Enviado' };
            case 'completed':
            case 'completado':
                return { bg: 'bg-green-100 text-green-700 border-green-200', label: 'Entregado' };
            case 'cancelled':
            case 'cancelado':
                return { bg: 'bg-red-100 text-red-700 border-red-200', label: 'Cancelado' };
            case 'paid':
            case 'pagado':
                return { bg: 'bg-emerald-100 text-emerald-700 border-emerald-200', label: 'Pagado' };
            default:
                // Handle mixed casing or other variations
                if (s.includes('pend')) return { bg: 'bg-orange-100 text-orange-700 border-orange-200', label: 'Pendiente' };
                if (s.includes('proc')) return { bg: 'bg-blue-100 text-blue-700 border-blue-200', label: 'Procesando' };
                return { bg: 'bg-gray-100 text-gray-600 border-gray-200', label: status };
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="w-full space-y-4 animate-pulse">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-24 bg-gray-50 rounded-[32px] border border-gray-100" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="animate-in font-montserrat fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-8">
                <h1 className="text-2xl font-medium text-gray-900 mb-2">Mis Pedidos</h1>
                <p className="text-sm text-gray-500">Historial de tus compras en Araí.</p>
            </div>

            {orders.length === 0 ? (
                <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-16 text-center">
                    <div className="bg-gray-50 h-24 w-24 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShoppingBag className="h-10 w-10 text-gray-200" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Aún no tienes pedidos</h3>
                    <p className="text-gray-400 text-sm mb-8 max-w-xs mx-auto">
                        Cuando realices tu primera compra aparecerá listada en esta sección.
                    </p>
                    <Link
                        href="/tienda"
                        className="inline-flex items-center justify-center bg-primary text-white font-medium py-3.5 px-10 rounded-2xl shadow-lg hover:shadow-primary/20 transition-all text-sm"
                    >
                        Comenzar a comprar
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <Link
                            key={order.id}
                            href={`/mi-cuenta/pedidos/${order.id}`}
                            className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-primary/20 transition-all group cursor-pointer"
                        >
                            <div className="flex items-center gap-5">
                                <div className="h-14 w-14 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                                    <Package className="h-6 w-6 text-gray-400 group-hover:text-primary transition-colors" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="font-bold text-gray-900 text-sm">#{order.id.slice(-6).toUpperCase()}</p>
                                        {(() => {
                                            const status = getStatusStyles(order.status);
                                            return (
                                                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-widest ${status.bg}`}>
                                                    {status.label}
                                                </span>
                                            );
                                        })()}
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-gray-500 italic">
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {new Date(order.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </div>
                                        <span>•</span>
                                        <span>{order.items.length} productos</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between md:justify-end gap-10">
                                <div className="text-right">
                                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-0.5">Total</p>
                                    <p className="text-lg font-bold text-gray-900">$ {order.total.toLocaleString('es-AR')}</p>
                                </div>
                                <div className="h-12 w-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                                    <ChevronRight className="h-5 w-5" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
