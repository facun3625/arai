"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, CheckCircle2, Mail } from "lucide-react";

interface PopupOverlayProps {
    location: "HOME" | "SHOP";
}

export function PopupOverlay({ location }: PopupOverlayProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [popupData, setPopupData] = useState<any>(null);
    const [email, setEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [subscribed, setSubscribed] = useState(false);
    const [subError, setSubError] = useState("");

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.includes("@")) {
            setSubError("Ingresá un email válido");
            return;
        }
        setIsSubmitting(true);
        setSubError("");
        try {
            const res = await fetch("/api/newsletter", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            if (res.ok) {
                setSubscribed(true);
            } else {
                const data = await res.json();
                setSubError(data.error || "No pudimos suscribirte, intentá de nuevo");
            }
        } catch {
            setSubError("Error de conexión, intentá de nuevo");
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        const fetchPopup = async () => {
            try {
                const res = await fetch("/api/admin/popups");
                const data = await res.json();
                if (Array.isArray(data)) {
                    const activePopup = data.find(p => p.location === location && p.isActive);
                    if (activePopup) {
                        const frequency = activePopup.displayFrequency || "SESSION";

                        if (frequency === "ALWAYS") {
                            setPopupData(activePopup);
                            setTimeout(() => setIsOpen(true), 1500);
                        } else {
                            // Check if already seen in this session
                            const hasSeenInSession = sessionStorage.getItem(`popup_seen_${location}`);
                            if (!hasSeenInSession) {
                                setPopupData(activePopup);
                                // Short delay to let the page load
                                setTimeout(() => setIsOpen(true), 1500);
                            }
                        }
                    }
                }
            } catch (error) {
                console.error("Error loading popup:", error);
            }
        };

        fetchPopup();
    }, [location]);

    const handleClose = () => {
        setIsOpen(false);
        if (popupData?.displayFrequency === "SESSION") {
            sessionStorage.setItem(`popup_seen_${location}`, "true");
        }
    };

    if (!popupData) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="absolute inset-0 cursor-pointer"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative max-w-[90%] md:max-w-[500px] w-auto overflow-hidden rounded-[2.5rem] border border-white/10 shadow-2xl bg-[#0a0a0a] flex items-center justify-center p-1"
                    >
                        <button
                            onClick={handleClose}
                            className="absolute top-4 right-4 z-10 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-md transition-all border border-white/10"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        {popupData.type === "NEWSLETTER" ? (
                            <div className="relative w-full rounded-[2.3rem] overflow-hidden bg-[#0a0a0a] text-white px-7 py-10 sm:px-10 sm:py-12 min-w-[280px] sm:min-w-[400px]">
                                {popupData.imageUrl && (
                                    <img
                                        src={popupData.imageUrl}
                                        alt=""
                                        className="w-full max-h-40 object-contain mb-6 mx-auto"
                                    />
                                )}
                                {subscribed ? (
                                    <div className="flex flex-col items-center text-center gap-4 py-6">
                                        <div className="h-14 w-14 rounded-full bg-primary/15 flex items-center justify-center">
                                            <CheckCircle2 className="h-7 w-7 text-primary" />
                                        </div>
                                        <h3 className="text-xl font-light tracking-tight">¡Gracias por suscribirte!</h3>
                                        <p className="text-sm text-white/50 max-w-xs">Vas a empezar a recibir nuestras novedades y promociones.</p>
                                        <button
                                            onClick={handleClose}
                                            className="mt-2 text-[11px] font-bold uppercase tracking-widest text-primary hover:underline"
                                        >
                                            Cerrar
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col text-center">
                                        <div className="h-12 w-12 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto mb-5">
                                            <Mail className="h-6 w-6 text-primary" />
                                        </div>
                                        <h3 className="text-2xl font-light tracking-tight mb-2">
                                            {popupData.title || "Suscribite a nuestro newsletter"}
                                        </h3>
                                        <p className="text-sm text-white/50 mb-7 max-w-sm mx-auto">
                                            {popupData.description || "Enterate primero de nuestras novedades, lanzamientos y promociones exclusivas."}
                                        </p>
                                        <form onSubmit={handleSubscribe} className="flex flex-col gap-3">
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => { setEmail(e.target.value); setSubError(""); }}
                                                placeholder="Tu email"
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-[14px] text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50 transition-colors text-center"
                                                required
                                            />
                                            {subError && <p className="text-[11px] text-red-400">{subError}</p>}
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="w-full h-13 py-3.5 bg-primary hover:bg-[#1a3f2d] text-white rounded-2xl font-bold text-[12px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                                            >
                                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Suscribirme"}
                                            </button>
                                        </form>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="relative w-full h-full rounded-[2.3rem] overflow-hidden">
                                <img
                                    src={popupData.imageUrl}
                                    alt="Popup Promotion"
                                    className="w-auto h-auto max-h-[80vh] md:max-h-[70vh] object-contain block mx-auto"
                                />
                                {/* Subtle Gradient Overlay */}
                                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
