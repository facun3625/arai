"use client";

import { useEffect, useState } from "react";
import { Coins, Gift, History, ChevronRight, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

export default function PuntosPage() {
    const { user } = useAuthStore();
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRedeeming, setIsRedeeming] = useState<string | null>(null);
    const [redeemedCoupon, setRedeemedCoupon] = useState<any>(null);

    useEffect(() => {
        fetchPointsData();
    }, []);

    const fetchPointsData = async () => {
        try {
            const res = await fetch(`/api/points?userId=${user?.id}`);
            const d = await res.json();
            setData(d);
        } catch (error) {
            console.error("Error fetching points data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRedeem = async (rewardId: string) => {
        setIsRedeeming(rewardId);
        try {
            const res = await fetch("/api/points/redeem", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rewardId, userId: user?.id })
            });
            const d = await res.json();
            if (res.ok) {
                setRedeemedCoupon(d.coupon);
                fetchPointsData(); // Refresh points balance
            } else {
                alert(d.error || "No pudimos realizar el canje");
            }
        } catch (error) {
            console.error("Error redeeming:", error);
        } finally {
            setIsRedeeming(null);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-gray-400 text-sm font-medium uppercase tracking-widest">Cargando tus beneficios...</p>
            </div>
        );
    }

    if (!data?.pointsEnabled) {
        return (
            <div className="bg-white rounded-[32px] border border-gray-100 p-12 text-center max-w-2xl mx-auto shadow-sm">
                <div className="h-20 w-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <Coins className="h-10 w-10 text-gray-300" />
                </div>
                <h2 className="text-2xl font-light text-gray-900 mb-2 font-montserrat tracking-tight">Sistema de Puntos en mantenimiento</h2>
                <p className="text-gray-500 text-sm leading-relaxed mb-8">
                    Vuelve pronto para descubrir todas las recompensas que tenemos preparadas para vos. Estamos mejorando nuestro programa de fidelidad.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header / Points Balance Card */}
            <div className="relative overflow-hidden bg-white text-gray-900 border border-gray-100 rounded-[32px] p-10 shadow-sm group">
                {/* Decorative Elements */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-[80px] group-hover:bg-primary/10 transition-all duration-700"></div>
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/5 rounded-full blur-[80px] group-hover:bg-primary/10 transition-all duration-700"></div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                            <span className="text-[11px] uppercase tracking-[0.2em] text-primary font-bold">Mis Puntos Araí</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-light font-montserrat flex items-baseline gap-2">
                            {data.points.toLocaleString()}
                            <span className="text-lg text-gray-400 font-normal">pts</span>
                        </h1>
                        <p className="text-gray-500 text-sm max-w-xs">
                            Seguí sumando puntos con cada compra y canjealos por beneficios exclusivos.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3">
                        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 flex items-center gap-4 group/card hover:bg-gray-100 transition-colors">
                            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover/card:scale-110 transition-transform">
                                <Coins className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-widest text-gray-400">Siguiente Nivel</p>
                                <p className="text-[14px] font-medium text-gray-900">Sumás en cada compra</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Redemption Success UI */}
            {redeemedCoupon && (
                <div className="bg-[#1a3f2d] border border-primary/30 rounded-[32px] p-8 text-white relative overflow-hidden animate-in slide-in-from-top-4 duration-500">
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 justify-between">
                        <div className="flex items-center gap-5">
                            <div className="h-16 w-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-black/20">
                                <CheckCircle2 className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-medium font-montserrat mb-1">¡Canje Exitoso!</h3>
                                <p className="text-white/60 text-sm">Tu cupón está listo para ser usado en el checkout.</p>
                            </div>
                        </div>
                        <div className="flex flex-col items-center md:items-end gap-3">
                            <div className="bg-white text-black px-6 py-4 rounded-2xl font-mono text-xl font-bold tracking-widest shadow-xl">
                                {redeemedCoupon.code}
                            </div>
                            <button
                                onClick={() => setRedeemedCoupon(null)}
                                className="text-[11px] uppercase tracking-widest text-white/40 hover:text-white transition-colors"
                            >
                                Cerrar aviso
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Rewards Grid */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 px-2">
                        <Gift className="h-5 w-5 text-primary" />
                        <h2 className="text-lg font-medium text-gray-900 tracking-tight">Recompensas Disponibles</h2>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {data.rewards.length === 0 ? (
                            <p className="text-gray-400 text-center py-12 text-sm italic">No hay recompensas disponibles en este momento.</p>
                        ) : data.rewards.map((reward: any) => (
                            <div
                                key={reward.id}
                                className={`group bg-white rounded-[24px] border border-gray-100 p-6 flex items-center justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${data.points < reward.pointsRequired ? 'opacity-60 grayscale-[0.5]' : ''}`}
                            >
                                <div className="flex items-center gap-5">
                                    <div className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-colors ${data.points >= reward.pointsRequired ? 'bg-primary/10 text-primary' : 'bg-gray-50 text-gray-300'}`}>
                                        <Gift className="h-7 w-7" />
                                    </div>
                                    <div>
                                        <h3 className="text-[15px] font-semibold text-gray-900 mb-0.5">{reward.title}</h3>
                                        <p className="text-[13px] text-primary font-bold">{reward.pointsRequired.toLocaleString()} puntos</p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleRedeem(reward.id)}
                                    disabled={data.points < reward.pointsRequired || isRedeeming === reward.id}
                                    className={`px-6 py-3 rounded-xl text-[12px] font-bold uppercase tracking-widest transition-all ${data.points >= reward.pointsRequired
                                        ? 'bg-black text-white hover:bg-primary shadow-lg shadow-black/5'
                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        } flex items-center gap-2`}
                                >
                                    {isRedeeming === reward.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <>Canjear <ChevronRight className="h-4 w-4" /></>
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Transaction History */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 px-2">
                        <History className="h-5 w-5 text-primary" />
                        <h2 className="text-lg font-medium text-gray-900 tracking-tight">Últimos Movimientos</h2>
                    </div>

                    <div className="bg-white rounded-[24px] border border-gray-100 divide-y divide-gray-50 overflow-hidden shadow-sm">
                        {data.transactions.length === 0 ? (
                            <div className="p-12 text-center">
                                <p className="text-gray-400 text-sm">Aún no tenés movimientos de puntos.</p>
                            </div>
                        ) : data.transactions.map((tx: any) => (
                            <div key={tx.id} className="p-5 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                <div className="space-y-1">
                                    <p className="text-[13px] font-medium text-gray-800">{tx.description}</p>
                                    <p className="text-[11px] text-gray-400">{new Date(tx.createdAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })}</p>
                                </div>
                                <div className={`text-[14px] font-bold ${tx.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-primary/5 border border-primary/10 rounded-2xl p-5 italic">
                        <p className="text-[12px] text-primary/70 leading-relaxed">
                            "Sumás puntos automáticamente con cada compra confirmada. ¡Seguí eligiendo Araí y disfrutá los beneficios!"
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
