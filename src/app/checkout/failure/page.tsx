"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { XCircle, Loader2 } from "lucide-react";
import Link from "next/link";

function FailureContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get("orderId");

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white font-montserrat px-4">
            <div className="text-center max-w-md">
                <XCircle className="mx-auto mb-4 text-red-500" size={64} strokeWidth={1.5} />
                <h1 className="text-2xl font-semibold text-gray-900 mb-2">Pago no completado</h1>
                <p className="text-gray-500 mb-8">
                    Hubo un problema al procesar tu pago. Tu pedido fue guardado — podés intentarlo de nuevo o elegir otro método de pago.
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
                        href="/checkout"
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                    >
                        Volver al checkout
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function CheckoutFailurePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-gray-400" size={32} />
            </div>
        }>
            <FailureContent />
        </Suspense>
    );
}
