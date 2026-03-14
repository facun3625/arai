"use client";

import { MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";

export const WhatsAppButton = () => {
    const [whatsappNumber, setWhatsappNumber] = useState("");

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch("/api/settings");
                if (res.ok) {
                    const data = await res.json();
                    if (data.whatsappNumber) {
                        setWhatsappNumber(data.whatsappNumber);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch whatsapp number", error);
            }
        };
        fetchSettings();

        const handleSettingsUpdated = () => fetchSettings();
        window.addEventListener("settings-updated", handleSettingsUpdated);
        return () => window.removeEventListener("settings-updated", handleSettingsUpdated);
    }, []);

    const waLink = whatsappNumber ? `https://wa.me/${whatsappNumber}` : "https://wa.me/5491112345678";

    return (
        <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-8 right-8 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-[0_10px_30px_rgba(37,211,102,0.4)] hover:scale-110 hover:shadow-[0_15px_40px_rgba(37,211,102,0.6)] transition-all duration-300 group overflow-hidden"
            aria-label="Contactar por WhatsApp"
        >
            <div className="absolute inset-0 bg-white/20 scale-0 group-hover:scale-100 transition-transform duration-500 rounded-full" />
            <MessageSquare className="h-6 w-6 relative z-10 fill-current" />

            {/* Animación de pulso externa */}
            <span className="absolute inset-0 rounded-full animate-ping bg-[#25D366]/40 -z-10" />
        </a>
    );
};
