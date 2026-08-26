"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";
import { trackPixelEvent } from "@/lib/fbPixel";
import { CheckCircle2, Loader2, MessageCircle } from "lucide-react";
import Link from "next/link";

function SuccessContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get("orderId");
    const { clearCart } = useCartStore();
    const [coordinateShipping, setCoordinateShipping] = useState<{ orderNumber: number; whatsappNumber: string } | null>(null);

    useEffect(() => {
        clearCart();
    }, [clearCart]);

    // Track Purchase from the authoritative order data (the cart is already cleared by now),
    // guarded so a page refresh doesn't fire a duplicate conversion for the same order.
    useEffect(() => {
        if (!orderId || typeof window === 'undefined') return;
        const trackedKey = `fb_purchase_tracked_${orderId}`;

        Promise.all([
            fetch(`/api/orders/${orderId}`).then(res => res.ok ? res.json() : null),
            fetch('/api/settings').then(res => res.ok ? res.json() : null),
        ]).then(([orderData, settings]) => {
            const order = orderData?.order;
            if (!order) return;

            if (order.shippingMethod === 'acordar' && settings?.whatsappNumber) {
                setCoordinateShipping({ orderNumber: order.orderNumber, whatsappNumber: settings.whatsappNumber });
            }

            if (sessionStorage.getItem(trackedKey)) return;
            trackPixelEvent('Purchase', {
                content_ids: order.items.map((i: any) => i.productId),
                content_type: 'product',
                contents: order.items.map((i: any) => ({ id: i.productId, quantity: i.quantity, item_price: i.price })),
                num_items: order.items.reduce((sum: number, i: any) => sum + i.quantity, 0),
                value: order.total,
                currency: 'ARS'
            });
            sessionStorage.setItem(trackedKey, '1');
        }).catch(() => {});
    }, [orderId]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white font-montserrat px-4">
            <div className="text-center max-w-md">
                <CheckCircle2 className="mx-auto mb-4 text-green-500" size={64} strokeWidth={1.5} />
                <h1 className="text-2xl font-semibold text-gray-900 mb-2">¡Pago aprobado!</h1>
                <p className="text-gray-500 mb-8">
                    Tu compra fue procesada exitosamente. Recibirás un email con los detalles de tu pedido.
                </p>

                {coordinateShipping && (
                    <div className="mb-8 p-5 bg-primary/5 border border-primary/20 rounded-2xl text-left">
                        <p className="text-sm font-semibold text-gray-900 mb-1">Coordinemos tu envío</p>
                        <p className="text-xs text-gray-500 leading-relaxed mb-4">
                            Escribinos por WhatsApp para definir el medio y el costo de envío de tu pedido.
                        </p>
                        <a
                            href={`https://wa.me/${coordinateShipping.whatsappNumber}?text=${encodeURIComponent(`Hola! Quiero coordinar el envío de mi pedido #${String(coordinateShipping.orderNumber).padStart(4, "0")}.`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl text-sm font-medium transition-colors"
                        >
                            <MessageCircle className="h-4 w-4" />
                            Coordinar por WhatsApp
                        </a>
                    </div>
                )}

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

export default function CheckoutSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-gray-400" size={32} />
            </div>
        }>
            <SuccessContent />
        </Suspense>
    );
}
