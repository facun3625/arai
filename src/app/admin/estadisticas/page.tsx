"use client";

import { useState, useEffect } from "react";

import {
    BarChart3,
    Calendar,
    ChevronDown,
    DollarSign,
    Package,
    Users,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    Loader2,
    Search,
    Filter,
    ArrowLeft,
    TrendingDown,
    ShoppingBag,
    ShoppingCart,
    Award,
    Layers
} from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth, startOfYear, subMonths } from "date-fns";
import { es } from "date-fns/locale";

export default function EstadisticasPage() {
    const [range, setRange] = useState<"7d" | "30d" | "90d" | "year" | "custom">("30d");
    const [dates, setDates] = useState({
        from: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
        to: format(new Date(), 'yyyy-MM-dd')
    });
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showRangeDropdown, setShowRangeDropdown] = useState(false);

    const fetchStats = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/admin/stats?from=${dates.from}&to=${dates.to}`);
            const stats = await res.json();
            if (!stats.error) {
                setData(stats);
            }
        } catch (error) {
            console.error("Error fetching admin stats:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, [dates]);

    const handleRangeChange = (newRange: typeof range) => {
        setRange(newRange);
        setShowRangeDropdown(false);
        const now = new Date();
        let fromDate = subDays(now, 30);

        if (newRange === "7d") fromDate = subDays(now, 7);
        else if (newRange === "30d") fromDate = subDays(now, 30);
        else if (newRange === "90d") fromDate = subDays(now, 90);
        else if (newRange === "year") fromDate = startOfYear(now);

        setDates({
            from: format(fromDate, 'yyyy-MM-dd'),
            to: format(now, 'yyyy-MM-dd')
        });
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            maximumFractionDigits: 0
        }).format(val);
    };

    // Calculate chart points (simple SVG)
    const renderChart = () => {
        if (!data?.revenueOverTime || data.revenueOverTime.length === 0) return null;
        
        const maxRevenue = Math.max(...data.revenueOverTime.map((d: any) => d.revenue), 100);
        const width = 800;
        const height = 200;
        const points = data.revenueOverTime.map((d: any, i: number) => {
            const x = (i / (data.revenueOverTime.length - 1)) * width;
            const y = height - (d.revenue / maxRevenue) * (height - 20);
            return `${x},${y}`;
        }).join(" ");

        return (
            <div className="relative w-full h-[250px] mt-8 group">
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
                    <defs>
                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    {/* Area */}
                    <path
                        d={`M 0,${height} ${points} L ${width},${height} Z`}
                        fill="url(#chartGradient)"
                    />
                    {/* Line */}
                    <path
                        d={`M ${points}`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        className="text-primary"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    {/* Dots on hover effect area - just visual indicators */}
                    {data.revenueOverTime.map((d: any, i: number) => {
                         const x = (i / (data.revenueOverTime.length - 1)) * width;
                         const y = height - (d.revenue / maxRevenue) * (height - 20);
                         return (
                             <circle key={i} cx={x} cy={y} r="4" className="fill-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                         )
                    })}
                </svg>
                {/* Labels */}
                <div className="flex justify-between mt-4 px-1">
                    {data.revenueOverTime.filter((_: any, i: number) => i % Math.ceil(data.revenueOverTime.length / 6) === 0 || i === data.revenueOverTime.length - 1).map((d: any, i: number) => (
                        <span key={i} className="text-[10px] text-white/20 uppercase tracking-widest font-bold font-mono">{d.label}</span>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <>
            <div className="space-y-10 animate-in fade-in duration-700">
                {/* Header with Date Filter */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 bg-[#0f0f0f] border border-white/5 p-6 md:p-8 rounded-[40px] relative">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 blur-[100px] -z-10 rounded-full" />
                    
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-primary/10 rounded-2xl">
                                <BarChart3 className="h-6 w-6 text-primary" />
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Estadísticas</h1>
                        </div>
                        <p className="text-white/40 text-[11px] md:text-[12px] uppercase tracking-widest font-medium">Análisis detallado de rendimiento y crecimiento</p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 relative z-20">
                        <div className="relative">
                            <button 
                                onClick={() => setShowRangeDropdown(!showRangeDropdown)}
                                className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl px-5 py-3 flex items-center gap-3 text-[13px] text-white font-medium transition-all"
                            >
                                <Calendar className="h-4 w-4 text-primary" />
                                {range === "7d" ? "Últimos 7 días" : range === "30d" ? "Últimos 30 días" : range === "90d" ? "Últimos 90 días" : range === "year" ? "Este año" : "Rango personalizado"}
                                <ChevronDown className={`h-4 w-4 text-white/40 transition-transform ${showRangeDropdown ? 'rotate-180' : ''}`} />
                            </button>

                            {showRangeDropdown && (
                                <div className="absolute top-full right-0 mt-2 w-56 bg-[#141414] border border-white/10 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in duration-200">
                                    {(["7d", "30d", "90d", "year"] as const).map((r) => (
                                        <button
                                            key={r}
                                            onClick={() => handleRangeChange(r)}
                                            className={`w-full text-left px-5 py-3 text-[13px] hover:bg-white/5 transition-colors ${range === r ? 'text-primary font-bold' : 'text-white/60'}`}
                                        >
                                            {r === "7d" ? "Últimos 7 días" : r === "30d" ? "Últimos 30 días" : r === "90d" ? "Últimos 90 días" : "Este año"}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                            <input 
                                type="date" 
                                value={dates.from}
                                onChange={(e) => setDates({ ...dates, from: e.target.value })}
                                className="bg-transparent text-[12px] text-white/80 focus:outline-none"
                            />
                            <span className="text-white/20">/</span>
                            <input 
                                type="date" 
                                value={dates.to}
                                onChange={(e) => setDates({ ...dates, to: e.target.value })}
                                className="bg-transparent text-[12px] text-white/80 focus:outline-none"
                            />
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-40 gap-4">
                        <Loader2 className="h-10 w-10 text-primary animate-spin" />
                        <p className="text-white/20 text-[11px] uppercase tracking-widest font-bold">Analizando datos del servidor...</p>
                    </div>
                ) : (
                    <>
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { name: "Ventas Totales", value: formatCurrency(data?.totalRevenue || 0), icon: DollarSign, color: "text-green-400" },
                                { name: "Ticket Promedio", value: formatCurrency(data?.avgTicket || 0), icon: Award, color: "text-primary" },
                                { name: "Pedidos", value: data?.totalOrders || 0, icon: ShoppingBag, color: "text-blue-400" },
                                { name: "Nuevos Clientes", value: data?.newUsersCount || 0, icon: Users, color: "text-purple-400" },
                            ].map((card, i) => (
                                <div key={i} className="bg-[#0f0f0f] border border-white/5 rounded-[32px] p-8 hover:bg-[#141414] transition-all relative overflow-hidden group">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="p-4 rounded-2xl bg-white/5 group-hover:scale-110 transition-transform">
                                            <card.icon className={`h-6 w-6 ${card.color}`} />
                                        </div>
                                    </div>
                                    <h3 className="text-white/40 text-[10px] uppercase tracking-widest font-bold mb-1 ml-1">{card.name}</h3>
                                    <p className="text-3xl font-bold text-white tracking-tight">{card.value}</p>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Revenue Chart */}
                            <div className="lg:col-span-2 bg-[#0f0f0f] border border-white/5 rounded-[40px] p-10 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 blur-[120px] -z-10" />
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
                                        <TrendingUp className="h-5 w-5 text-primary" />
                                        Evolución de Ventas
                                    </h2>
                                    <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                                            <span className="text-white/60">Ingresos (ARS)</span>
                                        </div>
                                    </div>
                                </div>
                                {renderChart()}
                            </div>

                            {/* Category Distribution */}
                            <div className="bg-[#0f0f0f] border border-white/5 rounded-[40px] p-10 flex flex-col">
                                <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-3 mb-10">
                                    <Layers className="h-5 w-5 text-primary" />
                                    Por Categoría
                                </h2>
                                <div className="space-y-8 flex-1">
                                    {data?.categorySplit?.length > 0 ? data.categorySplit.map((cat: any, i: number) => {
                                        const maxRev = data.categorySplit[0].revenue;
                                        const percent = (cat.revenue / maxRev) * 100;
                                        return (
                                            <div key={i} className="space-y-2.5 group">
                                                <div className="flex items-center justify-between text-[12px]">
                                                    <span className="text-white/60 font-medium group-hover:text-white transition-colors capitalize">{cat.name}</span>
                                                    <span className="text-white font-bold">{formatCurrency(cat.revenue)}</span>
                                                </div>
                                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
                                                        style={{ width: `${percent}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    }) : (
                                        <div className="text-center py-20 opacity-20 italic text-sm">Sin datos de categorías</div>
                                    )}
                                </div>
                            </div>

                            {/* Top Products Leaderboard */}
                            <div className="lg:col-span-3 bg-[#0f0f0f] border border-white/5 rounded-[40px] overflow-hidden">
                                <div className="p-10 border-b border-white/5">
                                    <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
                                        <Award className="h-5 w-5 text-yellow-500" />
                                        Productos Estrella
                                    </h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2">
                                    {data?.topProducts?.length > 0 ? (
                                        <div className="divide-y divide-white/5 md:border-r border-white/5">
                                            {data.topProducts.slice(0, 5).map((product: any, i: number) => (
                                                <div key={i} className="p-8 flex items-center justify-between hover:bg-white/[0.02] transition-colors group">
                                                    <div className="flex items-center gap-6">
                                                        <div className="text-2xl font-black text-white/5 group-hover:text-primary/20 transition-colors font-mono">0{i+1}</div>
                                                        <div className="w-14 h-14 bg-white/5 rounded-2xl overflow-hidden group-hover:scale-105 transition-transform">
                                                            {product.image ? <img src={product.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Package className="h-6 w-6 text-white/10" /></div>}
                                                        </div>
                                                        <div>
                                                            <p className="text-white font-bold text-[15px] group-hover:text-primary transition-colors">{product.name}</p>
                                                            <p className="text-[11px] text-white/30 uppercase tracking-widest font-bold mt-1">{product.quantity} unidades vendidas</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-white font-black text-lg">{formatCurrency(product.revenue)}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : null}
                                    {data?.topProducts?.length > 5 ? (
                                        <div className="divide-y divide-white/5">
                                            {data.topProducts.slice(5, 10).map((product: any, i: number) => (
                                                <div key={i} className="p-8 flex items-center justify-between hover:bg-white/[0.02] transition-colors group">
                                                    <div className="flex items-center gap-6">
                                                        <div className="text-2xl font-black text-white/5 group-hover:text-primary/20 transition-colors font-mono">{i+6 < 10 ? `0${i+6}` : i+6}</div>
                                                        <div className="w-14 h-14 bg-white/5 rounded-2xl overflow-hidden group-hover:scale-105 transition-transform">
                                                            {product.image ? <img src={product.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Package className="h-6 w-6 text-white/10" /></div>}
                                                        </div>
                                                        <div>
                                                            <p className="text-white font-bold text-[15px] group-hover:text-primary transition-colors">{product.name}</p>
                                                            <p className="text-[11px] text-white/30 uppercase tracking-widest font-bold mt-1">{product.quantity} unidades vendidas</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-white font-black text-lg">{formatCurrency(product.revenue)}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        !data?.topProducts?.length && <div className="p-20 text-center opacity-20 italic">No hay suficientes datos de ventas para este rango.</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}
