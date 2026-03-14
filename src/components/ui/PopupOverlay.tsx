"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface PopupOverlayProps {
    location: "HOME" | "SHOP";
}

export function PopupOverlay({ location }: PopupOverlayProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [popupData, setPopupData] = useState<any>(null);

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

                        <div className="relative w-full h-full rounded-[2.3rem] overflow-hidden">
                            <img
                                src={popupData.imageUrl}
                                alt="Popup Promotion"
                                className="w-auto h-auto max-h-[80vh] md:max-h-[70vh] object-contain block mx-auto"
                            />
                            {/* Subtle Gradient Overlay */}
                            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
