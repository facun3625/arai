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
    Trash2,
    Ban,
    Store,
    Phone
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

    // Track partial contact info for abandoned cart recovery
    useEffect(() => {
        if (!isHydrated) return;

        const syncContactInfo = async () => {
            if (contactInfo.email || contactInfo.phone) {
                const sessionId = localStorage.getItem("arai_cart_session");
                const subtotal = items.reduce((total, item) => {
                    const price = Number(item.price);
                    return total + (isNaN(price) ? 0 : price) * item.quantity;
                }, 0);

                try {
                    await fetch("/api/user/cart/sync", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            sessionId,
                            userId: user?.id,
                            email: contactInfo.email,
                            phone: contactInfo.phone,
                            name: contactInfo.firstName ? `${contactInfo.firstName} ${contactInfo.lastName}` : null,
                            items,
                            total: subtotal,
                        }),
                    });
                } catch (err) {
                    console.error("Partial sync failed", err);
                }
            }
        };

        const timer = setTimeout(syncContactInfo, 2000); // Debounce
        return () => clearTimeout(timer);
    }, [contactInfo.email, contactInfo.phone, contactInfo.firstName, contactInfo.lastName, items, isHydrated]);

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
    const [selectedShippingMethod, setSelectedShippingMethod] = useState<string | null>(null);
    const [ocaQuote, setOcaQuote] = useState<{ price: number; deliveryDays: number } | null>(null);
    const [ocaBranches, setOcaBranches] = useState<any[]>([]);
    const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
    const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
    const [paymentProofUrl, setPaymentProofUrl] = useState<string | null>(null);
    const [isUploadingProof, setIsUploadingProof] = useState(false);
    const [saveAddress, setSaveAddress] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [bankTransferInfo, setBankTransferInfo] = useState<{ cbu: string; alias: string; discount: number }>({ cbu: "", alias: "", discount: 15 });
    const [restrictions, setRestrictions] = useState<any[]>([]);
    const [activeRestriction, setActiveRestriction] = useState<any | null>(null);

    const fetchBankInfo = () => {
        fetch("/api/settings")
            .then(r => r.json())
            .then(d => {
                if (d && !d.error) {
                    setBankTransferInfo({
                        cbu: d.bankTransferCbu || "",
                        alias: d.bankTransferAlias || "",
                        discount: d.bankTransferDiscount ?? 15
                    });
                }
            })
            .catch(() => { });
        checkZipRestriction(shippingAddress.zipCode);
    };

    // Reactive Restriction Check
    useEffect(() => {
        if (shippingAddress.zipCode) {
            const found = restrictions.find(r => r.zipCode === shippingAddress.zipCode);
            setActiveRestriction(found || null);
        } else {
            setActiveRestriction(null);
        }
    }, [restrictions, shippingAddress.zipCode]);

    const fetchRestrictions = () => {
        fetch("/api/settings/restrictions")
            .then(r => r.json())
            .then(data => {
                if (Array.isArray(data)) setRestrictions(data);
            })
            .catch(() => { });
    };

    useEffect(() => {
        fetchBankInfo();
        fetchRestrictions();
        const handleSettingsUpdate = () => {
            fetchBankInfo();
            fetchRestrictions();
        };
        window.addEventListener("settings-updated", handleSettingsUpdate);
        return () => window.removeEventListener("settings-updated", handleSettingsUpdate);
    }, []);

    const checkZipRestriction = (zip: string) => {
        const found = restrictions.find(r => r.zipCode === zip);
        setActiveRestriction(found || null);
    };

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

    // OCA Shipping Logic - Trigger when entering step 2 (Shipping)
    useEffect(() => {
        const zip = shippingAddress.zipCode;
        if (currentStep === 2 && zip && zip.length === 4) {
            console.log("Triggering OCA calculation on Step 2 entry for zip:", zip);
            calculateOcaShipping();
        } else if (currentStep === 1) {
            // Optional: reset or keep, but let's ensure it's not selected if we go back
            // setOcaQuote(null);
            // setSelectedShipping(null);
        }
    }, [currentStep, shippingAddress.zipCode]);

    const calculateOcaShipping = async () => {
        setIsCalculatingShipping(true);
        try {
            // Calculate total weight (default to 1kg if not specified)
            const totalWeight = items.reduce((sum, item) => sum + (Number(item.weight) || 1) * item.quantity, 0);

            // 1. Get Quote
            const quoteRes = await fetch("/api/oca/quote", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    shippingAddress: selectedBranchId
                        ? { ...shippingAddress, branchName: ocaBranches.find(b => b.id === selectedBranchId)?.name }
                        : shippingAddress,
                    destinationZipCode: shippingAddress.zipCode,
                    weight: totalWeight,
                    volume: 0.02, // Placeholder average volume
                    packagesCount: 1
                }),
            });
            const quoteData = await quoteRes.json();
            if (quoteData.price) {
                setOcaQuote(quoteData);
                // Proactively set as default if none selected
                if (selectedShipping === null) {
                    setSelectedShipping(quoteData.price);
                    setSelectedShippingMethod('oca_domicilio');
                }
            } else if (quoteData.error) {
                setNotification({ message: `OCA: ${quoteData.error}`, type: 'error' });
            }

            // 2. Get Branches
            const branchesRes = await fetch(`/api/oca/branches?zipCode=${shippingAddress.zipCode}`);
            const branchesData = await branchesRes.json();
            if (branchesData.branches) {
                setOcaBranches(branchesData.branches);
            }
        } catch (err) {
            console.error("Error calculating OCA shipping:", err);
            setNotification({ message: "No pudimos conectar con OCA. Intenta de nuevo.", type: 'error' });
            setOcaQuote(null);
            // Don't reset selectedShipping here if it was already set manually, 
            // but for now let's keep it consistent.
            setSelectedShipping(null);
        } finally {
            console.log("OCA calculation finished.");
            setIsCalculatingShipping(false);
        }
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

    // Calculate discounts
    let totalDiscount = 0;

    // 1. Coupon Discount is evaluated first on subtotal
    if (appliedCoupon) {
        if (appliedCoupon.discountType === 'PERCENTAGE') {
            totalDiscount = subtotal * (appliedCoupon.discountValue / 100);
        } else {
            totalDiscount = appliedCoupon.discountValue;
        }
    }

    // 2. Apply dynamic discount if transfer is selected
    if (selectedPayment === 'transferencia') {
        totalDiscount += subtotal * (bankTransferInfo.discount / 100);
    }

    // Shipping cost only counts if not null
    const effectiveShippingCost = selectedShipping !== null ? selectedShipping : 0;
    const total = Math.max(0, subtotal + effectiveShippingCost - totalDiscount);

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
                    shippingCost: effectiveShippingCost,
                    total,
                    discount: totalDiscount,
                    paymentMethod: selectedPayment,
                    paymentProof: paymentProofUrl,
                    shippingAddress: selectedBranchId
                        ? { ...shippingAddress, branchName: ocaBranches.find(b => b.id === selectedBranchId)?.name, isBranch: true }
                        : shippingAddress,
                    contactInfo,
                    couponCode: appliedCoupon?.code,
                    selectedShippingMethod
                }),
            });

            if (!orderRes.ok) {
                const errorData = await orderRes.json();
                throw new Error(errorData.error || "Error al crear el pedido");
            }

            const { order } = await orderRes.json();

            // 2. Save address and update profile if requested and user is logged in
            if (isAuthenticated && user && saveAddress && !selectedSavedAddressId) {
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

            // 3. Handle Mercado Pago Redirection if selected
            if (selectedPayment === 'mercadopago') {
                const prefRes = await fetch('/api/payments/mercadopago/preference', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        orderId: order.id,
                        items: items,
                        customerEmail: contactInfo.email,
                        subtotal,
                        shippingCost: effectiveShippingCost,
                        discount: totalDiscount
                    })
                });

                if (prefRes.ok) {
                    const { init_point } = await prefRes.json();
                    if (init_point) {
                        // Clear Cart ONLY if preference was successful
                        clearCart();
                        window.location.href = init_point;
                        return;
                    }
                }

                // If preference fails, show warning but order is already created
                setNotification({
                    message: "Pedido creado, pero hubo un problema al conectar con Mercado Pago. Por favor, contáctanos.",
                    type: 'error'
                });
                setTimeout(() => router.push('/mi-cuenta/pedidos'), 3000);
            } else {
                // Clear cart for transferency
                clearCart();
                // Success feedback and redirect to Orders for Transferency
                setNotification({ message: "¡Compra realizada con éxito! Tu pedido ha sido registrado.", type: 'success' });
                setTimeout(() => router.push('/mi-cuenta/pedidos'), 2000);
            }
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

    if (items.length === 0 && !isProcessing) {
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
                                            <input type="text" placeholder="Código Postal *" required className="w-full px-5 py-4 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" value={shippingAddress.zipCode} onChange={(e) => {
                                                const val = e.target.value;
                                                setShippingAddress({ ...shippingAddress, zipCode: val });
                                            }} />
                                            <div className="col-span-full md:col-span-2">
                                                <input type="text" placeholder="Ciudad *" required className="w-full px-5 py-4 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" value={shippingAddress.city} onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })} />
                                            </div>
                                            <div className="col-span-full md:col-span-1">
                                                <select required className="w-full px-5 py-4 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-gray-700 appearance-none" value={shippingAddress.province} onChange={(e) => setShippingAddress({ ...shippingAddress, province: e.target.value })}>
                                                    <option value="" disabled>Provincia *</option>
                                                    <option value="CABA">CABA</option>
                                                    <option value="Buenos Aires">Buenos Aires</option>
                                                    <option value="Catamarca">Catamarca</option>
                                                    <option value="Chaco">Chaco</option>
                                                    <option value="Chubut">Chubut</option>
                                                    <option value="Córdoba">Córdoba</option>
                                                    <option value="Corrientes">Corrientes</option>
                                                    <option value="Entre Ríos">Entre Ríos</option>
                                                    <option value="Formosa">Formosa</option>
                                                    <option value="Jujuy">Jujuy</option>
                                                    <option value="La Pampa">La Pampa</option>
                                                    <option value="La Rioja">La Rioja</option>
                                                    <option value="Mendoza">Mendoza</option>
                                                    <option value="Misiones">Misiones</option>
                                                    <option value="Neuquén">Neuquén</option>
                                                    <option value="Río Negro">Río Negro</option>
                                                    <option value="Salta">Salta</option>
                                                    <option value="San Juan">San Juan</option>
                                                    <option value="San Luis">San Luis</option>
                                                    <option value="Santa Cruz">Santa Cruz</option>
                                                    <option value="Santa Fe">Santa Fe</option>
                                                    <option value="Santiago del Estero">Santiago del Estero</option>
                                                    <option value="Tierra del Fuego">Tierra del Fuego</option>
                                                    <option value="Tucumán">Tucumán</option>
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

                                        {/* Coupon Input - Moved here by user request */}
                                        <div className="mt-8 bg-white border border-gray-200 rounded-2xl p-4 shadow-sm border-dashed border-primary/20">
                                            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-3 px-1">Cupón de Descuento</p>
                                            {appliedCoupon ? (
                                                <div className="flex items-center justify-between w-full bg-primary/5 p-3 rounded-xl border border-primary/10">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-bold text-primary uppercase tracking-widest leading-none mb-1">{appliedCoupon.code}</span>
                                                        <span className="text-[10px] text-gray-500">
                                                            {appliedCoupon.discountType === 'PERCENTAGE' ? `${appliedCoupon.discountValue}% OFF en productos` : `$${appliedCoupon.discountValue} OFF en productos`}
                                                        </span>
                                                    </div>
                                                    <button type="button" onClick={handleRemoveCoupon} className="text-[10px] text-red-500 font-bold uppercase hover:underline">
                                                        Quitar
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 w-full">
                                                    <div className="relative flex-1">
                                                        <input
                                                            type="text"
                                                            placeholder="¿Tienes un cupón?"
                                                            value={couponCodeInput}
                                                            onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                                                            className="w-full bg-gray-50/50 border border-gray-100 text-xs rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none uppercase"
                                                        />
                                                    </div>
                                                    <button
                                                        type="button"
                                                        disabled={!couponCodeInput.trim() || isValidatingCoupon}
                                                        onClick={handleApplyCoupon}
                                                        className="bg-[#0c120e] text-white px-6 py-3 rounded-xl text-xs font-bold uppercase disabled:opacity-50 transition-all flex items-center shadow-lg"
                                                    >
                                                        {isValidatingCoupon ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Aplicar'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        {/* Restriction Alert for BLOCK_SALE */}
                                        {activeRestriction?.type === 'BLOCK_SALE' && (
                                            <div className="mt-8 p-6 bg-red-50 border border-red-100 rounded-3xl space-y-4 animate-in zoom-in-95 duration-300">
                                                <div className="flex items-center gap-3 text-red-600 mb-2">
                                                    <Ban className="h-6 w-6" />
                                                    <h3 className="font-bold text-sm uppercase tracking-widest">Venta no disponible en esta zona</h3>
                                                </div>
                                                <p className="text-sm text-gray-700 leading-relaxed font-medium">
                                                    {activeRestriction.message || "En este código postal contamos con locales físicos y/o franquicias disponibles. Te invitamos a visitarlos o comunicarte directamente con ellos para realizar tu compra."}
                                                </p>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                                    {activeRestriction.address && (
                                                        <div className="flex items-start gap-3 bg-white p-4 rounded-2xl border border-red-100 shadow-sm">
                                                            <Store className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                                            <div className="space-y-1">
                                                                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Dirección</p>
                                                                <p className="text-[11px] text-gray-600 font-medium leading-normal">{activeRestriction.address}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {activeRestriction.phone && (
                                                        <div className="flex items-start gap-3 bg-white p-4 rounded-2xl border border-red-100 shadow-sm">
                                                            <Phone className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                                            <div className="space-y-1">
                                                                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Teléfono</p>
                                                                <p className="text-[11px] text-gray-600 font-bold font-mono">{activeRestriction.phone}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </section>

                                    <button 
                                        type="submit" 
                                        disabled={activeRestriction?.type === 'BLOCK_SALE'}
                                        className="w-full h-16 bg-[#0c120e] hover:bg-black text-white rounded-2xl font-medium text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl transition-all hover:-translate-y-1 active:scale-95 group mt-8 disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
                                    >
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
                                            {activeRestriction?.type === 'BLOCK_SHIPPING' && (
                                                <div className="p-5 bg-orange-50 border border-orange-100 rounded-2xl flex items-start gap-4 mb-4">
                                                    <Truck className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
                                                    <div>
                                                        <h4 className="text-xs font-bold text-orange-700 uppercase tracking-widest mb-1">Entrega por Cadetería</h4>
                                                        <p className="text-xs text-orange-600/80 leading-relaxed font-medium">
                                                            {activeRestriction.message || "En este código postal los envíos por correo tradicional no están disponibles. Se realizará la entrega mediante nuestro servicio propio de cadetería."}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {isCalculatingShipping ? (
                                                <div className="py-12 flex flex-col items-center justify-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                                    <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
                                                    <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Consultando costos con OCA...</p>
                                                </div>
                                            ) : (
                                                <>
                                                    {/* OCA options only if NOT BLOCKED */}
                                                    {activeRestriction?.type !== 'BLOCK_SHIPPING' && (
                                                        <>
                                                            {ocaQuote && (
                                                                <label className={`block border ${selectedShippingMethod === 'oca_domicilio' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-gray-200 bg-white hover:border-gray-300'} rounded-2xl p-5 cursor-pointer transition-all`}>
                                                                    <div className="flex items-center justify-between">
                                                                        <div className="flex items-center gap-4">
                                                                            <input
                                                                                type="radio"
                                                                                name="shipping"
                                                                                checked={selectedShippingMethod === 'oca_domicilio'}
                                                                                onChange={() => {
                                                                                    setSelectedShippingMethod('oca_domicilio');
                                                                                    setSelectedShipping(ocaQuote.price);
                                                                                    setSelectedBranchId(null);
                                                                                }}
                                                                                className="w-5 h-5 text-primary border-gray-300 focus:ring-primary"
                                                                            />
                                                                            <div>
                                                                                <p className="font-medium text-gray-900 text-sm">OCA a Domicilio</p>
                                                                                <p className="text-xs text-gray-500 mt-1">Llega en aprox. {ocaQuote.deliveryDays} días hábiles</p>
                                                                            </div>
                                                                        </div>
                                                                        <span className="font-medium text-gray-900">$ {ocaQuote.price.toLocaleString('es-AR')}</span>
                                                                    </div>
                                                                </label>
                                                            )}

                                                            {ocaBranches.length > 0 && (
                                                                <div className={`border ${selectedShippingMethod === 'oca_sucursal' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-gray-200 bg-white hover:border-gray-300'} rounded-2xl p-5 transition-all`}>
                                                                    <label className="flex items-center justify-between cursor-pointer mb-4">
                                                                        <div className="flex items-center gap-4">
                                                                            <input
                                                                                type="radio"
                                                                                name="shipping"
                                                                                checked={selectedShippingMethod === 'oca_sucursal'}
                                                                                onChange={() => {
                                                                                    setSelectedShippingMethod('oca_sucursal');
                                                                                    setSelectedShipping(ocaQuote?.price ? ocaQuote.price * 0.7 : 3500); // Usually cheaper
                                                                                    if (ocaBranches.length === 1) setSelectedBranchId(ocaBranches[0].id);
                                                                                }}
                                                                                className="w-5 h-5 text-primary border-gray-300 focus:ring-primary"
                                                                            />
                                                                            <div>
                                                                                <p className="font-medium text-gray-900 text-sm">Retiro en Sucursal OCA</p>
                                                                                <p className="text-xs text-gray-500 mt-1">Más económico y rápido</p>
                                                                            </div>
                                                                        </div>
                                                                        <span className="font-medium text-gray-900">$ {(ocaQuote?.price ? ocaQuote.price * 0.7 : 3500).toLocaleString('es-AR')}</span>
                                                                    </label>

                                                                    {selectedShippingMethod === 'oca_sucursal' && (
                                                                        <div className="space-y-3 mt-4 animate-fade-in">
                                                                            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold px-1">Selecciona la sucursal:</p>
                                                                            <div className="grid grid-cols-1 gap-2">
                                                                                {ocaBranches.map((branch) => (
                                                                                    <button
                                                                                        key={branch.id}
                                                                                        type="button"
                                                                                        onClick={() => setSelectedBranchId(branch.id)}
                                                                                        className={`text-left p-3 rounded-xl border text-xs transition-all ${selectedBranchId === branch.id
                                                                                            ? 'border-primary bg-primary/10 font-bold'
                                                                                            : 'border-gray-100 bg-white hover:border-gray-200'}`}
                                                                                    >
                                                                                        <p className="text-gray-900">{branch.name}</p>
                                                                                        <p className="text-gray-500 font-normal mt-0.5">{branch.address}, {branch.city}</p>
                                                                                    </button>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </>
                                                    )}

                                                    {/* Cadetería / Local Delivery (When restricted) */}
                                                    {activeRestriction?.type === 'BLOCK_SHIPPING' && (
                                                        <label className={`block border ${selectedShippingMethod === 'cadete' ? 'border-orange-500 bg-orange-500/5 ring-1 ring-orange-500' : 'border-gray-200 bg-white hover:border-gray-300'} rounded-2xl p-5 cursor-pointer transition-all`}>
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-4">
                                                                    <input
                                                                        type="radio"
                                                                        name="shipping"
                                                                        checked={selectedShippingMethod === 'cadete'}
                                                                        onChange={() => {
                                                                            setSelectedShippingMethod('cadete');
                                                                            setSelectedShipping(0); // Assuming free for now or fixed price?
                                                                            setSelectedBranchId(null);
                                                                        }}
                                                                        className="w-5 h-5 text-orange-500 border-gray-300 focus:ring-orange-500"
                                                                    />
                                                                    <div>
                                                                        <p className="font-bold text-gray-900 text-sm">Cadetería / Entrega Local</p>
                                                                        <p className="text-xs text-gray-500 mt-1">Coordina la entrega con un cadete local</p>
                                                                    </div>
                                                                </div>
                                                                <span className="font-bold text-orange-500 uppercase text-[10px] tracking-widest">A coordinar</span>
                                                            </div>
                                                        </label>
                                                    )}

                                                    {subtotal > 60000 && activeRestriction?.type !== 'BLOCK_SHIPPING' && (
                                                        <label className={`block border ${selectedShippingMethod === 'gratis' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-gray-200 bg-white hover:border-gray-300'} rounded-2xl p-5 cursor-pointer transition-all relative overflow-hidden`}>
                                                            <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                                                            <div className="flex items-center justify-between pl-3">
                                                                <div className="flex items-center gap-4">
                                                                    <input
                                                                        type="radio"
                                                                        name="shipping"
                                                                        checked={selectedShippingMethod === 'gratis'}
                                                                        onChange={() => {
                                                                            setSelectedShippingMethod('gratis');
                                                                            setSelectedShipping(0);
                                                                            setSelectedBranchId(null);
                                                                        }}
                                                                        className="w-5 h-5 text-primary border-gray-300 focus:ring-primary"
                                                                    />
                                                                    <div>
                                                                        <p className="font-medium text-primary text-sm flex items-center gap-2">Envío Gratuito Promocional</p>
                                                                        <p className="text-xs text-gray-500 mt-1">Bonificado por superar los $60.000</p>
                                                                    </div>
                                                                </div>
                                                                <span className="font-bold text-primary uppercase text-xs tracking-widest">Gratis</span>
                                                            </div>
                                                        </label>
                                                    )}
                                                    {(!ocaQuote && !ocaBranches.length && !isCalculatingShipping) && (
                                                        <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 text-center">
                                                            <p className="text-amber-800 text-sm font-medium mb-1">No pudimos obtener tarifas automáticas</p>
                                                            <p className="text-amber-600 text-xs">Esto puede deberse a un Código Postal inválido o un problema temporal con OCA.</p>
                                                        </div>
                                                    )}

                                                    {/* Fallback Option if everything else fails or just as extra option */}
                                                    <label className={`block border ${selectedShippingMethod === 'acordar' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-gray-200 bg-white hover:border-gray-300'} rounded-2xl p-5 cursor-pointer transition-all`}>
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-4">
                                                                <input
                                                                    type="radio"
                                                                    name="shipping"
                                                                    checked={selectedShippingMethod === 'acordar'}
                                                                    onChange={() => {
                                                                        setSelectedShippingMethod('acordar');
                                                                        setSelectedShipping(0); // Price 0 or custom logic
                                                                        setSelectedBranchId(null);
                                                                    }}
                                                                    className="w-5 h-5 text-primary border-gray-300 focus:ring-primary"
                                                                />
                                                                <div>
                                                                    <p className="font-medium text-gray-900 text-sm">Envío a acordar / Otros medios</p>
                                                                    <p className="text-xs text-gray-500 mt-1">Nos contactaremos contigo para coordinar el envío</p>
                                                                </div>
                                                            </div>
                                                            <span className="font-bold text-gray-400 uppercase text-[10px] tracking-widest">A coordinar</span>
                                                        </div>
                                                    </label>
                                                </>
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
                                                {bankTransferInfo.discount > 0 && (
                                                    <div className="absolute top-0 right-0 bg-primary text-white text-[9px] uppercase tracking-widest font-bold px-3 py-1 rounded-bl-xl">{bankTransferInfo.discount}% OFF</div>
                                                )}
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
                                                            {/* CBU / Alias */}
                                                            {(bankTransferInfo.cbu || bankTransferInfo.alias) && (
                                                                <div className="mb-5 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl space-y-3">
                                                                    <p className="text-[10px] text-emerald-700 uppercase tracking-widest font-bold">Datos para transferir</p>
                                                                    {bankTransferInfo.cbu && (
                                                                        <div className="flex items-center justify-between">
                                                                            <span className="text-xs text-gray-500 font-medium">CBU</span>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => navigator.clipboard.writeText(bankTransferInfo.cbu)}
                                                                                className="text-xs font-mono font-bold text-gray-800 hover:text-primary transition-colors tracking-wide"
                                                                                title="Copiar CBU"
                                                                            >
                                                                                {bankTransferInfo.cbu}
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                    {bankTransferInfo.alias && (
                                                                        <div className="flex items-center justify-between">
                                                                            <span className="text-xs text-gray-500 font-medium">Alias</span>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => navigator.clipboard.writeText(bankTransferInfo.alias)}
                                                                                className="text-sm font-bold text-gray-800 hover:text-primary transition-colors tracking-wide"
                                                                                title="Copiar Alias"
                                                                            >
                                                                                {bankTransferInfo.alias}
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                    <p className="text-[10px] text-emerald-600 italic">Hacé clic en el número para copiarlo.</p>
                                                                </div>
                                                            )}
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
                            {/* Coupon summary info (read only) */}
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">Subtotal de productos</span>
                                <span className="font-medium text-gray-900">$ {subtotal.toLocaleString('es-AR')}</span>
                            </div>

                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">Costo de envío</span>
                                {currentStep === 1 ? (
                                    <span className="text-[10px] text-gray-400 italic">Se calcula en el siguiente paso</span>
                                ) : isCalculatingShipping ? (
                                    <span className="text-xs text-primary animate-pulse font-medium">calculando...</span>
                                ) : (ocaQuote || selectedShipping !== null) ? (
                                    <span className="font-medium text-gray-900">
                                        $ {(selectedShipping || ocaQuote?.price || 0).toLocaleString('es-AR')}
                                    </span>
                                ) : shippingAddress.zipCode?.length === 4 ? (
                                    <span className="text-xs text-red-400 italic">Error de conexión</span>
                                ) : (
                                    <span className="text-xs text-gray-400 italic">Ingresa CP</span>
                                )}
                            </div>

                            {totalDiscount > 0 && (
                                <div className="flex justify-between items-center text-sm text-primary animate-fade-in bg-primary/5 px-3 py-2 rounded-lg border border-primary/10">
                                    <div className="flex flex-col">
                                        <span className="font-medium">Descuentos Aplicados</span>
                                        <span className="text-[10px]">
                                            {[
                                                selectedPayment === 'transferencia' ? `Transferencia (${bankTransferInfo.discount}%)` : null,
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
