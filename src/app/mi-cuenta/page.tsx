"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { ShoppingBag, MapPin, User, ChevronRight, Clock, Package } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Order {
    id: string;
    total: number;
    status: string;
    createdAt: string;
}

export default function MiCuentaPage() {
    const { user } = useAuthStore();
    const [orders, setOrders] = useState<Order[]>([]);
    const [addressCount, setAddressCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user?.id) {
            const fetchData = async () => {
                try {
                    const [ordersRes, addressRes] = await Promise.all([
                        fetch(`/api/user/orders?userId=${user.id}`),
                        fetch(`/api/user/address?userId=${user.id}`)
                    ]);

                    const ordersData = await ordersRes.json();
                    const addressData = await addressRes.json();

                    if (ordersData.orders) setOrders(ordersData.orders);
                    if (addressData.addresses) setAddressCount(addressData.addresses.length);
                } catch (error) {
                    console.error("Dashboard fetch error:", error);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchData();
        } else {
            setIsLoading(false);
        }
    }, [user?.id]);

    const stats = [
        { label: "Mis Pedidos", value: orders.length.toString(), icon: ShoppingBag, color: "bg-blue-500", href: "/mi-cuenta/pedidos" },
        { label: "Direcciones", value: addressCount.toString(), icon: MapPin, color: "bg-green-500", href: "/mi-cuenta/direcciones" },
        { label: "Mi Perfil", icon: User, color: "bg-purple-500", href: "/mi-cuenta/perfil" },
    ];

    const getStatusText = (status: string) => {
        switch (status) {
            case 'PENDING': return 'Pendiente';
            case 'PAID': return 'Pagado';
            case 'SHIPPED': return 'Enviado';
            case 'COMPLETED': return 'Entregado';
            case 'CANCELLED': return 'Cancelado';
            default: return status;
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-light text-gray-900 tracking-tight mb-2">
                    ¡Hola, <span className="font-semibold text-primary">{user?.name?.split(' ')[0]}</span>!
                </h1>
                <p className="text-gray-500 text-sm">
                    Bienvenido a tu cuenta. Aquí puedes gestionar tus pedidos, direcciones y datos personales.
                </p>
            </div>

            {/* Quick Stats/Links Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {stats.map((stat) => (
                    <Link
                        key={stat.label}
                        href={stat.href}
                        className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm hover:shadow-md transition-all group"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`${stat.color} p-3 rounded-2xl text-white shadow-lg shadow-${stat.color.split('-')[1]}-200`}>
                                <stat.icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                                <p className={`text-2xl font-bold text-gray-900 ${isLoading ? 'animate-pulse bg-gray-100 rounded h-8 w-8 mt-1' : ''}`}>
                                    {!isLoading && stat.value}
                                </p>
                            </div>
                            <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-primary transition-colors" />
                        </div>
                    </Link>
                ))}
            </div>

            {/* Recent Orders Section */}
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-medium text-gray-900">Pedidos Recientes</h2>
                        <p className="text-sm text-gray-500">Tus últimas compras en Araí</p>
                    </div>
                    {orders.length > 0 && (
                        <Link href="/mi-cuenta/pedidos" className="text-primary text-[11px] font-bold uppercase tracking-widest hover:underline">
                            Ver todos
                        </Link>
                    )}
                </div>

                {isLoading ? (
                    <div className="p-8 space-y-4">
                        {[1, 2].map(i => (
                            <div key={i} className="h-20 bg-gray-50 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : orders.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="bg-gray-50 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShoppingBag className="h-8 w-8 text-gray-300" />
                        </div>
                        <p className="text-gray-400 text-sm mb-6">Aún no has realizado ningún pedido.</p>
                        <Link
                            href="/tienda"
                            className="inline-flex items-center justify-center bg-primary text-white font-medium py-3 px-8 rounded-xl shadow-lg hover:shadow-primary/20 transition-all text-sm"
                        >
                            Ir a la tienda
                        </Link>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {orders.slice(0, 3).map((order) => (
                            <Link
                                key={order.id}
                                href={`/mi-cuenta/pedidos/${order.id}`}
                                className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 bg-gray-50 rounded-xl flex items-center justify-center">
                                        <Package className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">#{order.id.slice(-6).toUpperCase()}</p>
                                        <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                                            <Clock className="h-3 w-3" />
                                            {new Date(order.createdAt).toLocaleDateString()}
                                            <span>•</span>
                                            <span className="font-medium text-primary/60">{getStatusText(order.status)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-gray-900">$ {order.total.toLocaleString('es-AR')}</p>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-primary transition-colors" />
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
