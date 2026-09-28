"use client";

import { useState, useEffect } from "react";
import {
    Users,
    Package,
    DollarSign,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    Loader2,
    ShoppingBag,
    Clock,
    CheckCircle2,
    Truck,
    AlertCircle,
    ShoppingCart
} from "lucide-react";

export default function DashboardPage() {
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch("/api/admin/dashboard/stats");
                const data = await res.json();
                if (!data.error) {
                    setStats(data);
                }
            } catch (error) {
                console.error("Error fetching stats:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStats();
    }, []);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            maximumFractionDigits: 0
        }).format(val);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                    <p className="text-slate-600 text-[11px] uppercase tracking-widest font-medium">cargando estadísticas...</p>
                </div>
            </div>
        );
    }

    const kpis = [
        {
            name: "ventas totales",
            value: formatCurrency(stats?.totalRevenue || 0),
            icon: DollarSign,
            trend: `${stats?.revenueTrend || 0}%`,
            isPositive: Number(stats?.revenueTrend || 0) >= 0,
            color: "text-green-700"
        },
        {
            name: "productos activos",
            value: stats?.totalProducts || "0",
            icon: Package,
            trend: "en stock",
            isPositive: true,
            color: "text-blue-700"
        },
        {
            name: "clientes nuevos",
            value: stats?.newUsers || "0",
            icon: Users,
            trend: "últ. 30 días",
            isPositive: true,
            color: "text-purple-700"
        },
        {
            name: "conversión",
            value: `${stats?.conversionRate || 0}%`,
            icon: TrendingUp,
            trend: "total",
            isPositive: true,
            color: "text-orange-700"
        },
    ];

    return (
        <>
            <div className="space-y-10 animate-in fade-in duration-700">
                {/* Header */}
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
                    <p className="text-slate-600 text-[12px] uppercase tracking-widest font-medium">Resumen en tiempo real de tu tienda</p>
                </div>

                {/* Grid de Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {kpis.map((stat) => (
                        <div key={stat.name} className="bg-white border border-slate-200 rounded-[32px] p-8 hover:bg-white transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[60px] -z-10 group-hover:bg-primary/10 transition-colors" />

                            <div className="flex items-center justify-between mb-6">
                                <div className={`p-4 rounded-2xl bg-slate-50 group-hover:scale-110 transition-transform`}>
                                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                                </div>
                                <span className={`text-[10px] font-bold ${stat.isPositive ? 'text-green-700' : 'text-red-700'} bg-slate-50 px-3 py-1.5 rounded-full flex items-center gap-1.5`}>
                                    {stat.trend}
                                    {stat.isPositive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                                </span>
                            </div>
                            <h3 className="text-slate-600 text-[10px] uppercase tracking-widest font-bold mb-1 ml-1">{stat.name}</h3>
                            <p className="text-3xl font-bold text-slate-900 tracking-tight">{stat.value}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Actividad Reciente */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <h2 className="text-slate-900 text-xl font-bold tracking-tight flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Clock className="h-5 w-5 text-primary" />
                                </div>
                                Actividad Reciente
                            </h2>
                            <button className="text-[11px] text-primary hover:text-primary-dark font-bold uppercase tracking-widest">Ver todos los pedidos</button>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden">
                            {stats?.recentOrders?.length > 0 ? (
                                <div className="divide-y divide-slate-200">
                                    {stats.recentOrders.map((order: any) => (
                                        <div key={order.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                                            <div className="flex items-center gap-5">
                                                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                                    <ShoppingBag className="h-5 w-5 text-slate-600 group-hover:text-primary transition-colors" />
                                                </div>
                                                <div>
                                                    <p className="text-slate-900 font-medium text-[15px]">{order.contactName} {order.contactLastName}</p>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <p className="text-[11px] text-slate-500 uppercase tracking-wider">#{String(order.orderNumber).padStart(4, "0")}</p>
                                                        <span className="text-slate-500">•</span>
                                                        <p className="text-[11px] text-slate-500">{new Date(order.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right flex flex-col items-end gap-2">
                                                <p className="text-slate-900 font-bold text-[16px]">{formatCurrency(order.total)}</p>
                                                <span className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${
                                                    order.status === 'COMPLETED' ? 'bg-green-500/10 text-green-700 border border-green-500/20' :
                                                    order.status === 'PENDING' ? 'bg-orange-500/10 text-orange-700 border border-orange-500/20' :
                                                    order.status === 'SHIPPED' ? 'bg-blue-500/10 text-blue-700 border border-blue-500/20' :
                                                    'bg-slate-50 text-slate-600 border border-slate-200'
                                                }`}>
                                                    {order.status === 'COMPLETED' ? 'Completado' :
                                                     order.status === 'PENDING' ? 'Pendiente' :
                                                     order.status === 'SHIPPED' ? 'Enviado' : order.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-20 flex flex-col items-center justify-center text-center gap-4">
                                    <div className="p-4 bg-slate-50 rounded-full">
                                        <AlertCircle className="h-10 w-10 text-slate-500" />
                                    </div>
                                    <p className="text-slate-500 text-sm italic">No se encontraron pedidos recientes.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Resumen de carritos y entregas */}
                    <div className="space-y-6">
                        <h2 className="text-slate-900 text-xl font-bold tracking-tight flex items-center gap-3 px-2">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <TrendingUp className="h-5 w-5 text-primary" />
                            </div>
                            Resumen Operativo
                        </h2>

                        <div className="bg-white border border-slate-200 rounded-[32px] p-6 space-y-6">
                            {/* Carritos Abandonados */}
                            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 group hover:border-primary/20 transition-all">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-2 bg-orange-500/10 rounded-xl">
                                        <ShoppingCart className="h-5 w-5 text-orange-700" />
                                    </div>
                                    <span className="text-[10px] font-bold text-orange-700 uppercase tracking-widest">Pendiente de recuperación</span>
                                </div>
                                <h3 className="text-slate-600 text-[10px] uppercase tracking-widest font-bold mb-1">Carritos Abandonados</h3>
                                <p className="text-2xl font-bold text-slate-900">{stats?.abandonedCartsCount || 0}</p>
                            </div>

                            {/* Próximas entregas (SHIPPED) */}
                            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 group hover:border-primary/20 transition-all">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-2 bg-blue-500/10 rounded-xl">
                                        <Truck className="h-5 w-5 text-blue-700" />
                                    </div>
                                    <span className="text-[10px] font-bold text-blue-700 uppercase tracking-widest">En Camino</span>
                                </div>
                                <h3 className="text-slate-600 text-[10px] uppercase tracking-widest font-bold mb-1">Pedidos Enviados</h3>
                                <p className="text-2xl font-bold text-slate-900">
                                    {stats?.ordersByStatus?.find((s: any) => s.status === 'SHIPPED')?._count?.id || 0}
                                </p>
                            </div>

                            {/* Pendientes de Preparación */}
                            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 group hover:border-primary/20 transition-all">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-2 bg-primary/10 rounded-xl">
                                        <CheckCircle2 className="h-5 w-5 text-primary" />
                                    </div>
                                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Para preparar</span>
                                </div>
                                <h3 className="text-slate-600 text-[10px] uppercase tracking-widest font-bold mb-1">Pedidos Pendientes</h3>
                                <p className="text-2xl font-bold text-slate-900">
                                    {stats?.ordersByStatus?.find((s: any) => s.status === 'PENDING')?._count?.id || 0}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
