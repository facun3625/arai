"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useCartStore } from "@/store/useCartStore";
import {
    ShoppingBag,
    Package,
    Clock,
    ChevronLeft,
    CheckCircle2,
    MapPin,
    CreditCard,
    Phone,
    User,
    RefreshCw,
    Loader2
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface OrderItem {
    id: string;
    productId: string;
    variantId: string | null;
    name: string;
    quantity: number;
    price: number;
    image: string | null;
}

interface Order {
    id: string;
    status: string;
    total: number;
    subtotal: number;
    shippingCost: number;
    discount: number;
    paymentMethod: string;
    shippingAddress: string;
    contactEmail: string;
    contactName: string;
    contactLastName: string;
    contactPhone: string;
    contactDni: string | null;
    paymentProof: string | null;
    createdAt: string;
    items: OrderItem[];
}

export default function PedidoDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuthStore();
    const { addItem } = useCartStore();
    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isReordering, setIsReordering] = useState(false);

    useEffect(() => {
        if (id) {
            fetch(`/api/orders/${id}`)
                .then(res => res.json())
                .then(data => {
                    if (data.order) setOrder(data.order);
                })
                .catch(err => console.error(err))
                .finally(() => setIsLoading(false));
        }
    }, [id]);

    const handleReorder = async () => {
        if (!order) return;
        setIsReordering(true);

        try {
            // Iterate through items and add to cart
            for (const item of order.items) {
                addItem({
                    id: item.productId,
                    name: item.name,
                    price: item.price,
                    image: item.image || "",
                    quantity: item.quantity,
                    variant: item.variantId || undefined,
                    // Note: addons are not stored explicitly in OrderItem schema as JSON yet, 
                    // but for basic reorder this works well for standard products/variants.
                });
            }

            // Redirect to cart
            router.push('/carrito');
        } catch (error) {
            console.error("Error reordering:", error);
        } finally {
            setIsReordering(false);
        }
    };

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
                if (s.includes('pend')) return { bg: 'bg-orange-100 text-orange-700 border-orange-200', label: 'Pendiente' };
                if (s.includes('proc')) return { bg: 'bg-blue-100 text-blue-700 border-blue-200', label: 'Procesando' };
                return { bg: 'bg-gray-100 text-gray-600 border-gray-200', label: status };
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                <Loader2 className="h-8 w-8 text-gray-200 animate-spin mb-4" />
                <p className="text-gray-400 text-sm">Cargando detalles del pedido...</p>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="text-center py-20">
                <p className="text-gray-500 mb-6">No se encontró el pedido.</p>
                <Link href="/mi-cuenta/pedidos" className="text-primary hover:underline font-medium">
                    Volver al listado
                </Link>
            </div>
        );
    }

    const address = JSON.parse(order.shippingAddress);

    return (
        <div className="animate-in font-montserrat fade-in slide-in-from-bottom-4 duration-700 max-w-4xl">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <Link href="/mi-cuenta/pedidos" className="flex items-center gap-2 text-gray-400 hover:text-primary transition-colors mb-4 text-xs font-medium uppercase tracking-widest">
                        <ChevronLeft className="h-4 w-4" />
                        Volver a pedidos
                    </Link>
                    <h1 className="text-2xl font-medium text-gray-900 mb-1">Pedido #{order.id.slice(-6).toUpperCase()}</h1>
                    <div className="flex items-center gap-3">
                        {(() => {
                            const status = getStatusStyles(order.status);
                            return (
                                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-widest ${status.bg}`}>
                                    {status.label}
                                </span>
                            );
                        })()}
                        <span className="text-xs text-gray-400 italic">
                            Realizado el {new Date(order.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}
                        </span>
                    </div>
                </div>

                <button
                    onClick={handleReorder}
                    disabled={isReordering}
                    className="bg-black text-white px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-primary transition-all shadow-lg hover:shadow-primary/20 flex items-center gap-2 disabled:opacity-50"
                >
                    {isReordering ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                    Repetir Pedido
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Items List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-50 bg-gray-50/30">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2">
                                <Package className="h-4 w-4 text-gray-400" />
                                Productos
                            </h3>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {order.items.map((item) => (
                                <div key={item.id} className="p-6 flex items-center gap-4">
                                    <div className="h-16 w-16 bg-gray-50 rounded-xl overflow-hidden shrink-0 border border-gray-100">
                                        {item.image ? (
                                            <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center">
                                                <Package className="h-6 w-6 text-gray-200" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-medium text-gray-900 truncate">{item.name}</h4>
                                        <p className="text-[11px] text-gray-400 mt-0.5 uppercase tracking-wider">
                                            {item.quantity} x $ {item.price.toLocaleString('es-AR')}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-gray-900">$ {(item.price * item.quantity).toLocaleString('es-AR')}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Summary Mobile Inline if needed, but we have the sidebar for desktop */}
                    <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-8 space-y-4">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                            Resumen de Pago
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Subtotal</span>
                                <span className="font-medium text-gray-900">$ {order.subtotal.toLocaleString('es-AR')}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Envío</span>
                                <span className="font-medium text-gray-900">
                                    {order.shippingCost === 0 ? "Gratis" : `$ ${order.shippingCost.toLocaleString('es-AR')}`}
                                </span>
                            </div>
                            {order.discount > 0 && (
                                <div className="flex justify-between text-sm text-emerald-600">
                                    <span>Descuento (Transferencia)</span>
                                    <span>- $ {order.discount.toLocaleString('es-AR')}</span>
                                </div>
                            )}
                            <div className="h-px bg-gray-50 my-2" />
                            <div className="flex justify-between items-center pt-2">
                                <span className="text-base font-bold text-gray-900">Total</span>
                                <span className="text-xl font-bold text-black">$ {order.total.toLocaleString('es-AR')}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar: Shipping & Contact */}
                <div className="space-y-6">
                    <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-6">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-2 border-b border-gray-50 pb-4">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            Envío
                        </h3>
                        <div className="space-y-4">
                            <div className="flex gap-3">
                                <div className="h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                                    <User className="h-4 w-4 text-gray-400" />
                                </div>
                                <div className="text-sm">
                                    <p className="font-medium text-gray-900">{order.contactName} {order.contactLastName}</p>
                                    {order.contactDni && <p className="text-xs text-gray-400 mt-1">DNI: {order.contactDni}</p>}
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                                    <MapPin className="h-4 w-4 text-gray-400" />
                                </div>
                                <div className="text-sm">
                                    <p className="text-gray-600 leading-relaxed">
                                        {address.street} {address.number}{address.apartment ? `, ${address.apartment}` : ""}
                                        <br />
                                        {address.city}, {address.province}
                                        <br />
                                        CP {address.zipCode}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                                    <Phone className="h-4 w-4 text-gray-400" />
                                </div>
                                <div className="text-sm font-medium text-gray-900">{order.contactPhone}</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-900 rounded-[32px] p-6 text-white shadow-xl shadow-black/10">
                        <h3 className="text-xs font-bold uppercase tracking-widest mb-4 opacity-60 flex items-center gap-2">
                            <CreditCard className="h-3 w-3" />
                            Método de Pago
                        </h3>
                        <p className="text-sm font-medium capitalize">{order.paymentMethod}</p>
                        {order.paymentMethod === 'transferencia' && (
                            <div className="mt-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                                {order.paymentProof ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                            <p className="text-[11px] font-bold uppercase tracking-widest text-white/90">Comprobante Adjunto</p>
                                        </div>
                                        <div className="relative group aspect-[4/3] rounded-xl overflow-hidden border border-white/10 bg-black/20">
                                            <img
                                                src={order.paymentProof}
                                                alt="Comprobante de pago"
                                                className="w-full h-full object-cover transition-transform group-hover:scale-110 cursor-zoom-in"
                                                onClick={() => window.open(order.paymentProof!, '_blank')}
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                                <span className="text-[10px] font-bold uppercase tracking-widest">Ver pantalla completa</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-[11px] text-white/70 leading-relaxed">
                                        {order.status === 'PENDING'
                                            ? "Recordá enviar el comprobante de transferencia para que podamos procesar tu pedido."
                                            : "No se adjuntó comprobante en este pedido."}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
