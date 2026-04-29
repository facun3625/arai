"use client";

import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { AIChatDrawer } from "./AIChatDrawer";

export const AIChatButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <AIChatDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} />

      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-8 right-8 z-50 bg-[#2d5a27] text-white p-4 rounded-full shadow-[0_10px_30px_rgba(45,90,39,0.4)] hover:scale-110 hover:shadow-[0_15px_40px_rgba(45,90,39,0.6)] transition-all duration-300 group overflow-hidden"
        aria-label="Abrir asistente de ventas IA"
      >
        <div className="absolute inset-0 bg-white/20 scale-0 group-hover:scale-100 transition-transform duration-500 rounded-full" />
        {isOpen ? (
          <X className="h-6 w-6 relative z-10" />
        ) : (
          <MessageCircle className="h-6 w-6 relative z-10" />
        )}
        <span className="absolute inset-0 rounded-full animate-ping bg-[#2d5a27]/40 -z-10" />
      </button>
    </>
  );
};
