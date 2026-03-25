"use client";

import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import ConfirmModal from "./ConfirmModal";
import Toast, { ToastType } from "./Toast";
import { AnimatePresence } from "framer-motion";

interface ConfirmOptions {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: "danger" | "success" | "warning" | "info";
}

interface AdminUtilsContextType {
    confirm: (options: ConfirmOptions) => Promise<boolean>;
    showToast: (message: string, type?: ToastType) => void;
}

const AdminUtilsContext = createContext<AdminUtilsContextType | undefined>(undefined);

export function AdminUtilsProvider({ children }: { children: React.ReactNode }) {
    // Confirm Modal State
    const [confirmState, setConfirmState] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        confirmText?: string;
        cancelText?: string;
        type?: "danger" | "success" | "warning" | "info";
        resolve: (value: boolean) => void;
    } | null>(null);

    // Toast State
    const [toasts, setToasts] = useState<{ id: number; message: string; type: ToastType }[]>([]);
    const toastIdCounter = useRef(0);

    const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
        return new Promise((resolve) => {
            setConfirmState({
                ...options,
                isOpen: true,
                resolve
            });
        });
    }, []);

    const showToast = useCallback((message: string, type: ToastType = "success") => {
        const id = ++toastIdCounter.current;
        setToasts(prev => [...prev, { id, message, type }]);
        
        // Auto-remove after 4s
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
    }, []);

    const handleConfirmClose = () => {
        if (confirmState) {
            confirmState.resolve(false);
            setConfirmState(null);
        }
    };

    const handleConfirmAction = () => {
        if (confirmState) {
            confirmState.resolve(true);
            setConfirmState(null);
        }
    };

    return (
        <AdminUtilsContext.Provider value={{ confirm, showToast }}>
            {children}
            
            {/* Global Confirm Modal */}
            {confirmState && (
                <ConfirmModal
                    isOpen={confirmState.isOpen}
                    onClose={handleConfirmClose}
                    onConfirm={handleConfirmAction}
                    title={confirmState.title}
                    message={confirmState.message}
                    confirmText={confirmState.confirmText}
                    cancelText={confirmState.cancelText}
                    type={confirmState.type}
                />
            )}

            {/* Global Toasts Container */}
            <div className="fixed bottom-8 right-8 z-[10000] flex flex-col gap-3 pointer-events-none">
                <AnimatePresence>
                    {toasts.map((t) => (
                        <div key={t.id} className="pointer-events-auto">
                            <Toast
                                message={t.message}
                                type={t.type}
                                onClose={() => setToasts(prev => prev.filter(toast => toast.id !== t.id))}
                            />
                        </div>
                    ))}
                </AnimatePresence>
            </div>
        </AdminUtilsContext.Provider>
    );
}

export function useAdminUtils() {
    const context = useContext(AdminUtilsContext);
    if (!context) {
        throw new Error("useAdminUtils must be used within an AdminUtilsProvider");
    }
    return context;
}
