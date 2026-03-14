"use client";

import { AdminLayout } from "@/components/admin/AdminLayout";
import {
    Users,
    Package,
    DollarSign,
    TrendingUp,
    ArrowUpRight
} from "lucide-react";

export default function DashboardPage() {
    const stats = [
        { name: "pedidos totales", value: "$450.000", icon: DollarSign, trend: "+12.5%", color: "text-green-400" },
        { name: "productos activos", value: "24", icon: Package, trend: "en stock", color: "text-blue-400" },
        { name: "clientes nuevos", value: "142", icon: Users, trend: "+18%", color: "text-purple-400" },
        { name: "tasa conversión", value: "3.2%", icon: TrendingUp, trend: "+0.4%", color: "text-orange-400" },
    ];

    return (
        <AdminLayout>
            <div className="space-y-8 animate-in fade-in duration-700">
                {/* Header */}
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-light text-white font-montserrat tracking-tight">dashboard</h1>
                    <p className="text-white/40 text-[11px] uppercase tracking-widest">resumen general de tu tienda</p>
                </div>

                {/* Grid de Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat) => (
                        <div key={stat.name} className="bg-white/[0.03] border border-white/5 rounded-3xl p-6 hover:bg-white/[0.05] transition-all group">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-2xl bg-white/5 group-hover:scale-110 transition-transform`}>
                                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                                </div>
                                <span className={`text-[10px] font-bold ${stat.color} bg-white/5 px-2 py-1 rounded-full flex items-center gap-1`}>
                                    {stat.trend}
                                    <ArrowUpRight className="h-3 w-3" />
                                </span>
                            </div>
                            <h3 className="text-white/40 text-[10px] uppercase tracking-widest font-medium mb-1">{stat.name}</h3>
                            <p className="text-2xl font-light text-white font-montserrat">{stat.value}</p>
                        </div>
                    ))}
                </div>

                {/* Placeholder para contenido futuro */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white/[0.03] border border-white/5 rounded-3xl h-[400px] flex items-center justify-center">
                        <p className="text-white/20 text-[11px] uppercase tracking-widest">gráficos de pedidos (próximamente)</p>
                    </div>
                    <div className="bg-white/[0.03] border border-white/5 rounded-3xl h-[400px] flex items-center justify-center">
                        <p className="text-white/20 text-[11px] uppercase tracking-widest">actividad reciente (próximamente)</p>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
