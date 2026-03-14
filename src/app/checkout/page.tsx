"use client";

import { useState } from "react";
import { useCartStore } from "@/store/useCartStore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    ChevronLeft,
    Lock,
    CreditCard,
    Truck,
    MapPin,
    User,
    CheckCircle2,
    Loader2,
    Upload,
    ArrowRightIcon,
    Trash2
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

type CheckoutStep = 1 | 2 | 3;

export default function CheckoutPage() {
    const { items, clearCart } = useCartStore();
    const { isAuthenticated, user } = useAuthStore();
    const [currentStep, setCurrentStep] = useState<CheckoutStep>(1);
    const [isHydrated, setIsHydrated] = useState(false);
    const router = useRouter();

    // Hydration fix
    useEffect(() => {
        setIsHydrated(true);
    }, []);

    // Scroll to top on step change
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentStep]);

    // Form State
    const [contactInfo, setContactInfo] = useState({
        email: "",
        firstName: "",
        lastName: "",
        dni: "",
        phone: ""
    });

    // Auto-fill effect
    useEffect(() => {
        if (isAuthenticated && user) {
            setContactInfo(prev => ({
                ...prev,
                email: user.email || prev.email,
                firstName: user.name || prev.firstName,
                lastName: user.lastName || prev.lastName,
                dni: user.dni || prev.dni,
                phone: user.phone || prev.phone,
            }));
        }
    }, [isAuthenticated, user]);

    const [shippingAddress, setShippingAddress] = useState({
        street: "",
        number: "",
        apartment: "",
        city: "",
        province: "",
        zipCode: ""
    });

    const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
    const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
    const [selectedSavedAddressId, setSelectedSavedAddressId] = useState<string | null>(null);

    const [selectedShipping, setSelectedShipping] = useState<number | null>(null);
    const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
    const [paymentProofUrl, setPaymentProofUrl] = useState<string | null>(null);
    const [isUploadingProof, setIsUploadingProof] = useState(false);
    const [saveAddress, setSaveAddress] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    // Coupon State
    const [couponCodeInput, setCouponCodeInput] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountType: string; discountValue: number } | null>(null);
    const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploadingProof(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            if (data.url) {
                setPaymentProofUrl(data.url);
                setNotification({ message: "Comprobante subido con éxito", type: 'success' });
            } else {
                setNotification({ message: "Error al subir el comprobante", type: 'error' });
            }
        } catch (error) {
            setNotification({ message: "Error de conexión al subir", type: 'error' });
        } finally {
            setIsUploadingProof(false);
        }
    };

    // Fetch saved addresses
    useEffect(() => {
        if (isAuthenticated && user?.id) {
            setIsLoadingAddresses(true);
            fetch(`/api/user/address?userId=${user.id}`)
                .then(res => res.json())
                .then(data => {
                    if (data.addresses) {
                        setSavedAddresses(data.addresses);
                        // If there's a default address, select it
                        const defaultAddr = data.addresses.find((a: any) => a.isDefault);
                        if (defaultAddr) handleSelectAddress(defaultAddr);
                    }
                })
                .finally(() => setIsLoadingAddresses(false));
        }
    }, [isAuthenticated, user?.id]);

    const handleSelectAddress = (addr: any) => {
        setSelectedSavedAddressId(addr.id);
        setShippingAddress({
            street: addr.street,
            number: addr.number,
            apartment: addr.apartment || "",
            city: addr.city,
            province: addr.province,
            zipCode: addr.zipCode
        });
        // Also update contact info if phone/dni exist in the address record
        setContactInfo(prev => ({
            ...prev,
            dni: addr.dni || prev.dni,
            phone: addr.phone || prev.phone
        }));
    };

    // Auto-hide notification
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const handleApplyCoupon = async () => {
        if (!couponCodeInput.trim()) return;
        setIsValidatingCoupon(true);

        try {
            const res = await fetch("/api/coupons/validate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: couponCodeInput.trim() }),
            });
            const data = await res.json();

            if (res.ok && data.success) {
                setAppliedCoupon(data.coupon);
                setCouponCodeInput("");
                setNotification({ message: "¡Cupón aplicado correctamente!", type: 'success' });
            } else {
                setNotification({ message: data.error || "Cupón inválido", type: 'error' });
            }
        } catch (error) {
            setNotification({ message: "Error al validar el cupón", type: 'error' });
        } finally {
            setIsValidatingCoupon(false);
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setNotification({ message: "Cupón eliminado", type: 'success' });
    };

    // Dynamic Calculations
    const subtotal = items.reduce((total, item) => {
        const price = Number(item.price);
        return total + (isNaN(price) ? 0 : price) * item.quantity;
    }, 0);

    const shippingCost = selectedShipping || 0;

    // Calculate discounts
    let totalDiscount = 0;

    // 1. Coupon Discount is evaluated first on subtotal
    if (appliedCoupon) {
        if (appliedCoupon.discountType === 'PERCENTAGE') {
            totalDiscount += subtotal * (appliedCoupon.discountValue / 100);
        } else {
            totalDiscount += appliedCoupon.discountValue;
        }
    }

    // 2. Apply 15% discount if transfer is selected (applied to subtotal after coupon maybe, or just subtotal. Let's do subtotal)
    if (selectedPayment === 'transferencia') {
        totalDiscount += subtotal * 0.15;
    }

    const total = Math.max(0, subtotal + shippingCost - totalDiscount);

    const handleNextStep = (e: React.FormEvent) => {
        e.preventDefault();
        if (currentStep < 3) setCurrentStep((prev) => (prev + 1) as CheckoutStep);
    };

    const handleFinalPurchase = async () => {
        if (!selectedPayment) return;

        setIsProcessing(true);

        try {
            // 1. Create Order
            const orderRes = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user?.id,
                    items,
                    subtotal,
                    shippingCost,
                    total,
                    discount: totalDiscount,
                    paymentMethod: selectedPayment,
                    paymentProof: paymentProofUrl,
                    shippingAddress,
                    contactInfo,
                    couponCode: appliedCoupon?.code
                }),
            });

            if (!orderRes.ok) {
                const errorData = await orderRes.json();
                throw new Error(errorData.error || "Error al crear el pedido");
            }

            // 2. Save address and update profile if requested and user is logged in
            if (isAuthenticated && user && saveAddress && !selectedSavedAddressId) {
                // Save Address
                await fetch('/api/user/address', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: user.id,
                        ...shippingAddress,
                        phone: contactInfo.phone,
                        dni: contactInfo.dni,
                        isDefault: true
                    }),
                });

                // Update User Profile (DNI/Phone)
                await fetch('/api/user/profile', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: user.id,
                        name: contactInfo.firstName,
                        lastName: contactInfo.lastName,
                        email: contactInfo.email,
                        dni: contactInfo.dni,
                        phone: contactInfo.phone
                    }),
                });
            }

            // 3. Clear Cart
            clearCart();

            // 4. Success feedback and redirect to Orders
            setNotification({ message: "¡Compra realizada con éxito! Tu pedido ha sido registrado.", type: 'success' });
            setTimeout(() => router.push('/mi-cuenta/pedidos'), 2000);
        } catch (error: any) {
            console.error("Error finalizing purchase:", error);
            setNotification({
                message: error.message || "Ocurrió un error al procesar la compra. Por favor, revisa los datos.",
                type: 'error'
            });
        } finally {
            setIsProcessing(false);
        }
    };

    if (!isHydrated) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white font-montserrat px-4">
                <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
                <p className="text-gray-400 text-sm uppercase tracking-widest font-bold">Cargando Checkout...</p>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#fafafa] font-montserrat px-4">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                    <Lock className="h-8 w-8 text-gray-300" />
                </div>
                <h1 className="text-2xl font-light text-gray-900 mb-2">Checkout Incompleto</h1>
                <p className="text-gray-500 mb-8 text-center max-w-sm">Tu carrito está vacío. Añade productos para poder finalizar la compra.</p>
                <Link href="/tienda" className="bg-[#0c120e] text-white px-8 py-4 rounded-xl font-medium tracking-wide uppercase text-xs hover:bg-black transition-colors">
                    Volver a la Tienda
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white font-montserrat flex justify-center w-full overflow-hidden">
            <div className="w-full max-w-7xl px-4 lg:px-8 flex flex-col md:flex-row relative">
                {/* LEFT COLUMN: Checkout Form */}
                <div className="w-full md:w-1/2 lg:w-[55%] flex flex-col border-r border-gray-100/80 bg-white z-10">

                    <div className="flex-1 pt-6 pb-16 overflow-y-auto pr-0 md:pr-12 lg:pr-20">
                        <AnimatePresence>
                            {notification && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                                    animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                    className={`p-4 rounded-2xl border text-sm flex items-center gap-3 ${notification.type === 'success'
                                        ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                                        : 'bg-red-50 border-red-100 text-red-700'
                                        }`}
                                >
                                    <div className={`w-2 h-2 rounded-full shrink-0 ${notification.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                    {notification.message}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Progress Indicator */}
                        <div className="flex items-center justify-between mb-12 relative">
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-gray-100 w-full -z-10 rounded-full"></div>
                            <div
                                className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-primary -z-10 rounded-full transition-all duration-500"
                                style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
                            ></div>

                            {[
                                { step: 1, label: "Información", icon: <User className="h-4 w-4" /> },
                                { step: 2, label: "Envío", icon: <Truck className="h-4 w-4" /> },
                                { step: 3, label: "Pago", icon: <CreditCard className="h-4 w-4" /> }
                            ].map((s) => (
                                <div key={s.step} className="flex flex-col items-center gap-2 bg-white px-2">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors shadow-sm ${currentStep >= s.step ? 'bg-primary text-white' : 'bg-gray-50 text-gray-300 border border-gray-100'}`}>
                                        {currentStep > s.step ? <CheckCircle2 className="h-5 w-5" /> : s.icon}
                                    </div>
                                    <span className={`text-[9px] uppercase tracking-widest font-bold ${currentStep >= s.step ? 'text-primary' : 'text-gray-300'}`}>
                                        {s.label}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* STEPS CONTAINER */}
                        <form onSubmit={handleNextStep}>

                            {/* STEP 1: CONTACT & ADDRESS */}
                            {currentStep === 1 && (
                                <div className="space-y-10 animate-fade-in">

                                    {/* Contact Section */}
                                    <section>
                                        <div className="flex items-center justify-between mb-6">
                                            <h2 className="text-lg font-medium text-gray-900 tracking-tight">Información de Contacto</h2>
                                            <div className="text-xs text-gray-500">¿Ya tienes cuenta? <button type="button" className="text-primary font-medium hover:underline">Inicia Sesión</button></div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="col-span-full">
                                                <input type="email" placeholder="Correo Electrónico *" required className="w-full px-5 py-4 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" value={contactInfo.email} onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })} />
                                            </div>
                                            <input type="text" placeholder="Nombre *" required className="w-full px-5 py-4 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" value={contactInfo.firstName} onChange={(e) => setContactInfo({ ...contactInfo, firstName: e.target.value })} />
                                            <input type="text" placeholder="Apellido *" required className="w-full px-5 py-4 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" value={contactInfo.lastName} onChange={(e) => setContactInfo({ ...contactInfo, lastName: e.target.value })} />
                                            <input type="text" placeholder="Teléfono *" required className="w-full px-5 py-4 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" value={contactInfo.phone} onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })} />
                                            <input type="text" placeholder="DNI / CUIT *" required className="w-full px-5 py-4 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" value={contactInfo.dni} onChange={(e) => setContactInfo({ ...contactInfo, dni: e.target.value })} />
                                        </div>
                                    </section>

                                    {/* Address Section */}
                                    <section>
                                        <div className="flex items-center justify-between mb-6">
                                            <h2 className="text-lg font-medium text-gray-900 tracking-tight">Dirección de Envío</h2>
                                            {selectedSavedAddressId && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedSavedAddressId(null);
                                                        setShippingAddress({ street: "", number: "", apartment: "", city: "", province: "", zipCode: "" });
                                                    }}
                                                    className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline"
                                                >
                                                    Usar nueva dirección
                                                </button>
                                            )}
                                        </div>

                                        {isAuthenticated && savedAddresses.length > 0 && (
                                            <div className="flex gap-4 overflow-x-auto pb-6 mb-2 scrollbar-hide -mx-1 px-1">
                                                {savedAddresses.map((addr) => (
                                                    <button
                                                        key={addr.id}
                                                        type="button"
                                                        onClick={() => handleSelectAddress(addr)}
                                                        className={`shrink-0 w-64 p-4 rounded-2xl border text-left transition-all ${selectedSavedAddressId === addr.id
                                                            ? 'border-primary bg-primary/5 ring-1 ring-primary shadow-sm'
                                                            : 'border-gray-100 bg-white hover:border-gray-200'
                                                            }`}
                                                    >
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className={`p-2 rounded-lg ${selectedSavedAddressId === addr.id ? 'bg-primary text-white' : 'bg-gray-50 text-gray-400'}`}>
                                                                <MapPin className="h-4 w-4" />
                                                            </div>
                                                            {addr.isDefault && <span className="text-[8px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-full">Principal</span>}
                                                        </div>
                                                        <p className="text-sm font-bold text-gray-900 truncate">{addr.street} {addr.number}</p>
                                                        <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider">{addr.city}, {addr.province}</p>
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 transition-all duration-500 ${selectedSavedAddressId ? 'opacity-50 pointer-events-none grayscale-[0.5]' : ''}`}>
                                            <div className="col-span-full">
                                                <input type="text" placeholder="Calle / Avenida *" required className="w-full px-5 py-4 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" value={shippingAddress.street} onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })} />
                                            </div>
                                            <input type="text" placeholder="Número *" required className="w-full px-5 py-4 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" value={shippingAddress.number} onChange={(e) => setShippingAddress({ ...shippingAddress, number: e.target.value })} />
                                            <input type="text" placeholder="Piso / Depto" className="w-full px-5 py-4 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" value={shippingAddress.apartment} onChange={(e) => setShippingAddress({ ...shippingAddress, apartment: e.target.value })} />
                                            <input type="text" placeholder="Código Postal *" required className="w-full px-5 py-4 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" value={shippingAddress.zipCode} onChange={(e) => setShippingAddress({ ...shippingAddress, zipCode: e.target.value })} />
                                            <div className="col-span-full md:col-span-2">
                                                <input type="text" placeholder="Ciudad *" required className="w-full px-5 py-4 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" value={shippingAddress.city} onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })} />
                                            </div>
                                            <div className="col-span-full md:col-span-1">
                                                <select required className="w-full px-5 py-4 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-gray-700 appearance-none" value={shippingAddress.province} onChange={(e) => setShippingAddress({ ...shippingAddress, province: e.target.value })}>
                                                    <option value="" disabled>Provincia *</option>
                                                    <option value="Misiones">Misiones</option>
                                                    <option value="Buenos Aires">Buenos Aires</option>
                                                    <option value="CABA">CABA</option>
                                                    <option value="Santa Fe">Santa Fe</option>
                                                    <option value="Córdoba">Córdoba</option>
                                                </select>
                                            </div>
                                        </div>

                                        {isAuthenticated && (
                                            <div className="mt-4 flex items-center gap-3 px-1">
                                                <input
                                                    type="checkbox"
                                                    id="saveAddress"
                                                    checked={saveAddress}
                                                    onChange={(e) => setSaveAddress(e.target.checked)}
                                                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                                                />
                                                <label htmlFor="saveAddress" className="text-sm text-gray-600 cursor-pointer">
                                                    Guardar esta dirección para futuras compras
                                                </label>
                                            </div>
                                        )}
                                    </section>

                                    <button type="submit" className="w-full h-16 bg-[#0c120e] hover:bg-black text-white rounded-2xl font-medium text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl transition-all hover:-translate-y-1 active:scale-95 group mt-8">
                                        Continuar con Envíos <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-2" />
                                    </button>
                                </div>
                            )}

                            {/* STEP 2: SHIPPING OPTIONS */}
                            {currentStep === 2 && (
                                <div className="space-y-8 animate-fade-in">
                                    <section>
                                        <h2 className="text-lg font-medium text-gray-900 tracking-tight mb-6">Selecciona un Método de Envío</h2>

                                        {/* Mock Address Feedback */}
                                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-start gap-4 mb-8">
                                            <MapPin className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Enviando a</p>
                                                <p className="text-sm text-gray-900 font-medium">{shippingAddress.street} {shippingAddress.number}, {shippingAddress.city}, {shippingAddress.province}</p>
                                                <button type="button" onClick={() => setCurrentStep(1)} className="text-primary text-[10px] uppercase tracking-widest font-bold mt-2 hover:underline">Modificar</button>
                                            </div>
                                        </div>

                                        {/* Shipping Rates */}
                                        <div className="space-y-4">
                                            <label className={`block border ${selectedShipping === 5000 ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-gray-200 bg-white hover:border-gray-300'} rounded-2xl p-5 cursor-pointer transition-all`}>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <input type="radio" name="shipping" value={5000} onChange={() => setSelectedShipping(5000)} className="w-5 h-5 text-primary border-gray-300 focus:ring-primary" />
                                                        <div>
                                                            <p className="font-medium text-gray-900 text-sm">Envío a Domicilio Estándar</p>
                                                            <p className="text-xs text-gray-500 mt-1">3 a 5 días hábiles</p>
                                                        </div>
                                                    </div>
                                                    <span className="font-medium text-gray-900">$ 5.000</span>
                                                </div>
                                            </label>

                                            <label className={`block border ${selectedShipping === 3500 ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-gray-200 bg-white hover:border-gray-300'} rounded-2xl p-5 cursor-pointer transition-all`}>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <input type="radio" name="shipping" value={3500} onChange={() => setSelectedShipping(3500)} className="w-5 h-5 text-primary border-gray-300 focus:ring-primary" />
                                                        <div>
                                                            <p className="font-medium text-gray-900 text-sm">Retiro en Sucursal Andreani</p>
                                                            <p className="text-xs text-gray-500 mt-1">2 a 4 días hábiles</p>
                                                        </div>
                                                    </div>
                                                    <span className="font-medium text-gray-900">$ 3.500</span>
                                                </div>
                                            </label>

                                            {subtotal > 60000 && (
                                                <label className={`block border ${selectedShipping === 0 ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-gray-200 bg-white hover:border-gray-300'} rounded-2xl p-5 cursor-pointer transition-all relative overflow-hidden`}>
                                                    <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                                                    <div className="flex items-center justify-between pl-3">
                                                        <div className="flex items-center gap-4">
                                                            <input type="radio" name="shipping" value={0} onChange={() => setSelectedShipping(0)} className="w-5 h-5 text-primary border-gray-300 focus:ring-primary" />
                                                            <div>
                                                                <p className="font-medium text-primary text-sm flex items-center gap-2">Envío Gratuito Promocional</p>
                                                                <p className="text-xs text-gray-500 mt-1">Has activado nuestro envío bonificado.</p>
                                                            </div>
                                                        </div>
                                                        <span className="font-bold text-primary uppercase text-xs tracking-widest">Gratis</span>
                                                    </div>
                                                </label>
                                            )}
                                        </div>
                                    </section>

                                    <button type="submit" disabled={selectedShipping === null} className="w-full h-16 bg-[#0c120e] hover:bg-black text-white rounded-2xl font-medium text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed mt-8 group">
                                        Continuar a Pago <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-2" />
                                    </button>
                                </div>
                            )}

                            {/* STEP 3: PAYMENT OPTIONS */}
                            {currentStep === 3 && (
                                <div className="space-y-8 animate-fade-in">
                                    <section>
                                        <h2 className="text-lg font-medium text-gray-900 tracking-tight mb-6">Selecciona un Método de Pago</h2>

                                        <div className="space-y-4">
                                            <label className={`block border ${selectedPayment === 'transferencia' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-gray-200 bg-white hover:border-gray-300'} rounded-2xl p-5 cursor-pointer transition-all relative overflow-hidden`}>
                                                <div className="absolute top-0 right-0 bg-primary text-white text-[9px] uppercase tracking-widest font-bold px-3 py-1 rounded-bl-xl">15% OFF</div>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <input type="radio" name="payment" value="transferencia" checked={selectedPayment === 'transferencia'} onChange={() => setSelectedPayment('transferencia')} className="w-5 h-5 text-primary border-gray-300 focus:ring-primary" />
                                                        <div>
                                                            <p className="font-medium text-gray-900 text-sm">Transferencia Bancaria</p>
                                                            <p className="text-xs text-gray-500 mt-1">Recibirás los datos al finalizar</p>
                                                        </div>
                                                    </div>
                                                    <CreditCard className="h-5 w-5 text-gray-400" />
                                                </div>

                                                <AnimatePresence>
                                                    {selectedPayment === 'transferencia' && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            className="mt-6 pt-6 border-t border-gray-100 overflow-hidden"
                                                        >
                                                            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-4">Adjuntar Comprobante (Opcional)</p>
                                                            <div className="flex items-center gap-4">
                                                                <label className="flex-1">
                                                                    <div className={`border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all ${paymentProofUrl ? 'border-emerald-200 bg-emerald-50/30' : 'border-gray-100 bg-gray-50/30 hover:border-gray-200'}`}>
                                                                        {isUploadingProof ? (
                                                                            <Loader2 className="h-6 w-6 text-primary animate-spin" />
                                                                        ) : paymentProofUrl ? (
                                                                            <div className="flex items-center gap-2 text-emerald-600">
                                                                                <CheckCircle2 className="h-5 w-5" />
                                                                                <span className="text-xs font-bold uppercase tracking-wider">Cargado</span>
                                                                            </div>
                                                                        ) : (
                                                                            <>
                                                                                <Upload className="h-6 w-6 text-gray-300 mb-2" />
                                                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Subir Imagen</span>
                                                                            </>
                                                                        )}
                                                                        <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                                                                    </div>
                                                                </label>
                                                                {paymentProofUrl && (
                                                                    <div className="w-16 h-16 rounded-xl border border-gray-100 overflow-hidden shrink-0 shadow-sm relative group">
                                                                        <img src={paymentProofUrl} alt="Comprobante" className="w-full h-full object-cover" />
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => setPaymentProofUrl(null)}
                                                                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                                                                        >
                                                                            <Trash2 className="h-4 w-4" />
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </label>
                                            <label className={`block border ${selectedPayment === 'mercadopago' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-gray-200 bg-white hover:border-gray-300'} rounded-2xl p-5 cursor-pointer transition-all`}>
                                                <div className="flex items-center gap-4">
                                                    <input type="radio" name="payment" value="mercadopago" onChange={() => setSelectedPayment('mercadopago')} className="w-5 h-5 text-primary border-gray-300 focus:ring-primary" />
                                                    <div>
                                                        <p className="font-medium text-gray-900 text-sm flex items-center gap-2">MercadoPago</p>
                                                        <p className="text-xs text-gray-500 mt-1">Tarjetas de crédito, débito o dinero en cuenta.</p>
                                                    </div>
                                                </div>
                                            </label>
                                        </div>
                                    </section>

                                    <button
                                        type="button"
                                        disabled={selectedPayment === null || isProcessing}
                                        onClick={handleFinalPurchase}
                                        className="w-full h-16 bg-primary hover:bg-primary/90 text-white rounded-2xl font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-[0_10px_40px_-10px_rgba(40,167,69,0.5)] transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:hover:translate-y-0 disabled:shadow-none disabled:cursor-not-allowed mt-8"
                                    >
                                        {isProcessing ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            '¡Finalizar y Pagar!'
                                        )}
                                    </button>

                                    <p className="text-center text-[10px] text-gray-400 flex items-center justify-center gap-2 mt-4">
                                        <Lock className="h-3 w-3" /> Conexión segura y cifrada
                                    </p>
                                </div>
                            )}

                        </form>
                    </div>
                </div>

                {/* RIGHT COLUMN: Order Summary */}
                <div className="w-full md:w-1/2 lg:w-[45%] bg-[#fafafa] flex flex-col relative">
                    <div className="absolute inset-y-0 left-full w-[50vw] bg-[#fafafa] -z-10 hidden md:block"></div>

                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-bl-[100px] z-0 pointer-events-none"></div>

                    <div className="sticky top-20 flex-1 pt-6 pb-16 overflow-y-auto pl-0 md:pl-12 lg:pl-16 pr-4 md:pr-12 lg:pr-16 z-10">
                        <h2 className="text-2xl font-light text-gray-900 tracking-tight mb-8">Resumen de tu Pedido</h2>

                        {/* Items List */}
                        <div className="space-y-6 mb-10 max-h-[40vh] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                            {items.map((item) => {
                                // Safe parsing logic inline
                                let validVariantAttrs: [string, string][] = [];
                                try {
                                    let parsed: any = item.variant;
                                    // Unwrap strings until it's an object or primitive
                                    while (typeof parsed === 'string') {
                                        try { parsed = JSON.parse(parsed); } catch { break; }
                                    }

                                    let finalObj = null;
                                    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                                        if ('attributes' in parsed) {
                                            let inner = parsed.attributes;
                                            while (typeof inner === 'string') {
                                                try { inner = JSON.parse(inner); } catch { break; }
                                            }
                                            if (inner && typeof inner === 'object' && !Array.isArray(inner)) {
                                                finalObj = inner;
                                            }
                                        } else {
                                            finalObj = parsed;
                                        }
                                    }

                                    if (finalObj && typeof finalObj === 'object' && !Array.isArray(finalObj)) {
                                        const blockedKeys = ['id', 'productId', 'price', 'compareAtPrice', 'stock', 'sku', 'images', 'attributes', 'createdAt', 'updatedAt'];
                                        for (const [key, value] of Object.entries(finalObj)) {
                                            if (!blockedKeys.includes(key) && !/^\d+$/.test(key) && value !== null && typeof value !== 'object') {
                                                validVariantAttrs.push([key, String(value)]);
                                            }
                                        }
                                    }
                                } catch (e) {
                                    // Ignore
                                }

                                // Addons parsing
                                let validAddons: [string, string][] = [];
                                if (item.addons && typeof item.addons === 'object' && !Array.isArray(item.addons)) {
                                    for (const [name, terms] of Object.entries(item.addons)) {
                                        if (!/^\d+$/.test(name)) {
                                            let termNames: string[] = [];
                                            if (Array.isArray(terms)) {
                                                termNames = terms;
                                            } else if (typeof terms === 'string') {
                                                try {
                                                    const parsedTerms = JSON.parse(terms);
                                                    termNames = Array.isArray(parsedTerms) ? parsedTerms : [terms];
                                                } catch {
                                                    termNames = [terms];
                                                }
                                            }
                                            if (termNames.length > 0) {
                                                validAddons.push([name, termNames.join(', ')]);
                                            }
                                        }
                                    }
                                }

                                return (
                                    <div key={item.id} className="flex gap-4 items-center">
                                        <div className="w-16 h-16 rounded-xl bg-white border border-gray-100 overflow-hidden relative shadow-sm shrink-0">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                            <span className="absolute -top-2 -right-2 bg-gray-500 text-white text-[9px] font-bold w-5 h-5 rounded-full flex items-center justify-center z-10 border-2 border-white">
                                                {item.quantity}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 tracking-tight truncate">{item.name}</p>

                                            {validVariantAttrs.length > 0 && (
                                                <p className="text-[10px] text-gray-500 mt-0.5 truncate uppercase tracking-wide">
                                                    {validVariantAttrs.map(([key, val]) => `${key}: ${val}`).join(' / ')}
                                                </p>
                                            )}
                                            {validAddons.length > 0 && (
                                                <p className="text-[10px] text-gray-500 mt-0.5 truncate uppercase tracking-wide">
                                                    {validAddons.map(([key, val]) => val).join(', ')}
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-sm font-medium text-gray-900">$ {(Number(item.price) * item.quantity).toLocaleString('es-AR')}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="h-px bg-gray-200 mb-6"></div>

                        {/* Totals Calculation */}
                        <div className="space-y-4 mb-6">
                            {/* Coupon Input */}
                            <div className="bg-white border border-gray-200 rounded-xl p-3 flex items-center justify-between mb-2 shadow-sm">
                                {appliedCoupon ? (
                                    <div className="flex items-center justify-between w-full">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-primary uppercase tracking-widest">{appliedCoupon.code}</span>
                                            <span className="text-[10px] text-gray-500">Cupón aplicado ({appliedCoupon.discountType === 'PERCENTAGE' ? `${appliedCoupon.discountValue}% OFF` : `$${appliedCoupon.discountValue} OFF`})</span>
                                        </div>
                                        <button onClick={handleRemoveCoupon} className="text-[10px] text-red-500 font-bold uppercase hover:underline">
                                            Quitar
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 w-full">
                                        <input
                                            type="text"
                                            placeholder="Ingresar cupón de descuento"
                                            value={couponCodeInput}
                                            onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                                            className="w-full bg-transparent border-none text-xs focus:ring-0 px-2 outline-none uppercase"
                                        />
                                        <button
                                            disabled={!couponCodeInput.trim() || isValidatingCoupon}
                                            onClick={handleApplyCoupon}
                                            className="bg-[#0c120e] text-white px-4 py-2 rounded-lg text-xs font-bold uppercase disabled:opacity-50 transition-all flex items-center"
                                        >
                                            {isValidatingCoupon ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Aplicar'}
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">Subtotal de productos</span>
                                <span className="font-medium text-gray-900">$ {subtotal.toLocaleString('es-AR')}</span>
                            </div>

                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">Costo de envío</span>
                                {currentStep === 1 ? (
                                    <span className="text-xs text-gray-400 italic">calculando...</span>
                                ) : shippingCost === 0 ? (
                                    <span className="text-primary font-bold text-xs uppercase tracking-widest">Gratis</span>
                                ) : (
                                    <span className="font-medium text-gray-900">$ {shippingCost.toLocaleString('es-AR')}</span>
                                )}
                            </div>

                            {totalDiscount > 0 && (
                                <div className="flex justify-between items-center text-sm text-primary animate-fade-in bg-primary/5 px-3 py-2 rounded-lg border border-primary/10">
                                    <div className="flex flex-col">
                                        <span className="font-medium">Descuentos Aplicados</span>
                                        <span className="text-[10px]">
                                            {[
                                                selectedPayment === 'transferencia' ? 'Transferencia (15%)' : null,
                                                appliedCoupon ? `Cupón ${appliedCoupon.code}` : null
                                            ].filter(Boolean).join(' + ')}
                                        </span>
                                    </div>
                                    <span className="font-bold">- $ {totalDiscount.toLocaleString('es-AR', { maximumFractionDigits: 0 })}</span>
                                </div>
                            )}
                        </div>

                        <div className="h-px bg-gray-200 mb-6"></div>

                        <div className="flex justify-between items-end mb-8">
                            <span className="text-gray-500 text-lg">Total</span>
                            <div className="text-right">
                                <span className="text-gray-400 text-xs mr-2 uppercase tracking-widest">AR$</span>
                                <span className="text-4xl font-light text-primary tracking-tighter">$ {total.toLocaleString('es-AR')}</span>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
