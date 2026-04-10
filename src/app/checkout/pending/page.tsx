"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";
import { Clock, Loader2 } from "lucide-react";
import Link from "next/link";

function PendingContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get("orderId");
    const { clearCart } = useCartStore();

    useEffect(() => {
        clearCart();
    }, [clearCart]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white font-montserrat px-4">
            <div className="text-center max-w-md">
                <Clock className="mx-auto mb-4 text-yellow-500" size={64} strokeWidth={1.5} />
                <h1 className="text-2xl font-semibold text-gray-900 mb-2">Pago pendiente</h1>
                <p className="text-gray-500 mb-8">
                    Tu pedido fue registrado pero el pago está pendiente de acreditación.
                    Te notificaremos por email cuando se confirme.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    {orderId && (
                        <Link
                            href={`/mi-cuenta/pedidos/${orderId}`}
                            className="px-6 py-3 bg-[#2d4a1e] text-white rounded-lg hover:bg-[#3d6228] transition-colors text-sm font-medium"
                        >
                            Ver mi pedido
                        </Link>
                    )}
                    <Link
                        href="/tienda"
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                    >
                        Seguir comprando
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function CheckoutPendingPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-gray-400" size={32} />
            </div>
        }>
            <PendingContent />
        </Suspense>
    );
}
