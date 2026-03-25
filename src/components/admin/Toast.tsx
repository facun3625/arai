"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, X, Info } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

interface ToastProps {
    message: string;
    type: ToastType;
    onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
    const getIcon = () => {
        switch (type) {
            case "success": return <CheckCircle2 className="h-4 w-4 text-green-500" />;
            case "error": return <AlertCircle className="h-4 w-4 text-red-500" />;
            case "warning": return <AlertCircle className="h-4 w-4 text-yellow-500" />;
            default: return <Info className="h-4 w-4 text-blue-500" />;
        }
    };

    const getBgStyle = () => {
        switch (type) {
            case "success": return "bg-[#0c120e] border-green-500/20";
            case "error": return "bg-[#0c120e] border-red-500/20";
            case "warning": return "bg-[#0c120e] border-yellow-500/20";
            default: return "bg-[#0c120e] border-blue-500/20";
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            className={`flex items-center gap-3 px-6 py-4 rounded-2xl border backdrop-blur-md shadow-2xl ${getBgStyle()}`}
        >
            <div className="flex items-center gap-3">
                {getIcon()}
                <span className="text-[11px] font-bold uppercase tracking-widest text-white/90">
                    {message}
                </span>
            </div>
            <button 
                onClick={onClose}
                className="ml-4 p-1 hover:bg-white/5 rounded-full text-white/20 hover:text-white transition-all"
            >
                <X className="h-3 w-3" />
            </button>
        </motion.div>
    );
}
