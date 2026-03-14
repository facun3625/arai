"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { Ticket, Loader2, Copy, CheckCircle2 } from "lucide-react";

interface Coupon {
    id: string;
    code: string;
    discountType: string;
    discountValue: number;
    isActive: boolean;
    createdAt: string;
}

export default function MisCuponesPage() {
    const { user, isAuthenticated } = useAuthStore();
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    useEffect(() => {
        if (!isAuthenticated || !user?.id) return;

        const fetchCoupons = async () => {
            try {
                const res = await fetch(`/api/user/coupons?userId=${user.id}`);
                const data = await res.json();
                if (data.coupons) {
                    setCoupons(data.coupons);
                }
            } catch (error) {
                console.error("Error fetching coupons:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCoupons();
    }, [isAuthenticated, user]);

    const handleCopy = (code: string, id: string) => {
        navigator.clipboard.writeText(code);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-light text-gray-900 tracking-tight">Mis Cupones</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Aquí encontrarás los cupones que has generado canjeando tus puntos.
                </p>
            </div>

            {coupons.length === 0 ? (
                <div className="bg-white rounded-[24px] border border-gray-100 p-12 text-center shadow-sm">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Ticket className="h-8 w-8 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes cupones</h3>
                    <p className="text-gray-500 text-sm max-w-sm mx-auto">
                        Ve a la sección "Mis Puntos" para canjear tus puntos acumulados por descuentos exclusivos.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {coupons.map((coupon) => (
                        <div
                            key={coupon.id}
                            className={`bg-white rounded-[24px] border p-6 transition-all flex flex-col ${coupon.isActive
                                ? 'border-primary/20 shadow-sm hover:shadow-md hover:border-primary/40'
                                : 'border-gray-100 opacity-60 grayscale'
                                }`}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${coupon.isActive ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-400'
                                    }`}>
                                    <Ticket className="h-6 w-6" />
                                </div>
                                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${coupon.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'
                                    }`}>
                                    {coupon.isActive ? 'Disponible' : 'Usado'}
                                </span>
                            </div>

                            <div className="mb-6 flex-1">
                                <h3 className="text-2xl font-medium text-gray-900 tracking-tight mb-1">
                                    {coupon.discountType === 'PERCENTAGE'
                                        ? `${coupon.discountValue}% OFF`
                                        : `$${coupon.discountValue} OFF`}
                                </h3>
                                <p className="text-xs text-gray-500">
                                    Generado el {new Date(coupon.createdAt).toLocaleDateString('es-AR')}
                                </p>
                            </div>

                            <div className="flex flex-col gap-2 mt-auto">
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 flex items-center justify-center">
                                        <span className={`font-mono font-bold tracking-widest ${coupon.isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                                            {coupon.code}
                                        </span>
                                    </div>
                                    {coupon.isActive && (
                                        <button
                                            onClick={() => handleCopy(coupon.code, coupon.id)}
                                            className="h-[46px] w-[46px] shrink-0 bg-[#0c120e] hover:bg-black text-white rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-sm"
                                            title="Copiar código"
                                        >
                                            {copiedId === coupon.id ? (
                                                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                            ) : (
                                                <Copy className="h-4 w-4" />
                                            )}
                                        </button>
                                    )}
                                </div>
                                <p className="text-[10px] text-center uppercase tracking-widest font-bold text-gray-400">
                                    {coupon.isActive ? 'Cópialo y úsalo en el checkout' : 'Descuento ya aplicado'}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
