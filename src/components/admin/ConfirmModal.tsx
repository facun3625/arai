"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X, CheckCircle2, AlertCircle } from "lucide-react";
import { useEffect } from "react";

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: "danger" | "success" | "warning" | "info";
    isLoading?: boolean;
}

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    type = "danger",
    isLoading = false
}: ConfirmModalProps) {
    
    // Close on escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        if (isOpen) window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [isOpen, onClose]);

    const getIcon = () => {
        switch (type) {
            case "danger": return <AlertTriangle className="h-6 w-6 text-red-500" />;
            case "success": return <CheckCircle2 className="h-6 w-6 text-green-500" />;
            case "warning": return <AlertCircle className="h-6 w-6 text-yellow-500" />;
            default: return <AlertCircle className="h-6 w-6 text-blue-500" />;
        }
    };

    const getButtonClass = () => {
        switch (type) {
            case "danger": return "bg-red-500 hover:bg-red-600 shadow-red-500/20";
            case "success": return "bg-green-500 hover:bg-green-600 shadow-green-500/20";
            case "warning": return "bg-yellow-500 hover:bg-yellow-600 shadow-yellow-500/20";
            default: return "bg-primary hover:bg-primary/90 shadow-primary/20";
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="relative w-full max-w-md bg-[#0c120e] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl"
                    >
                        {/* Header with Icon */}
                        <div className="p-8 pb-4 flex items-center gap-4">
                            <div className={`p-3 rounded-2xl bg-white/5 border border-white/5`}>
                                {getIcon()}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-light text-white font-montserrat tracking-tight leading-tight">
                                    {title}
                                </h3>
                            </div>
                            <button 
                                onClick={onClose}
                                className="p-2 hover:bg-white/5 rounded-full text-white/20 hover:text-white transition-all"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="px-8 pb-8">
                            <p className="text-white/40 text-[13px] leading-relaxed">
                                {message}
                            </p>
                        </div>

                        {/* Footer */}
                        <div className="p-4 bg-white/5 border-t border-white/5 flex gap-3">
                            <button
                                onClick={onClose}
                                disabled={isLoading}
                                className="flex-1 px-4 py-3 rounded-2xl text-[11px] font-bold uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/5 transition-all disabled:opacity-50"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={onConfirm}
                                disabled={isLoading}
                                className={`flex-1 px-4 py-3 rounded-2xl text-[11px] font-bold uppercase tracking-widest text-white shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${getButtonClass()}`}
                            >
                                {isLoading ? (
                                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : confirmText}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
