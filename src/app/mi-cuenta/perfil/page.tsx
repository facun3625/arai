"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { User, Mail, Lock, Save, Loader2, CreditCard, Phone } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function PerfilPage() {
    const { user, login } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    // Auto-hide notification
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsLoading(true);
        const formData = new FormData(e.target as HTMLFormElement);
        const data = Object.fromEntries(formData);

        try {
            const response = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    name: data.name,
                    lastName: data.lastName,
                    email: data.email,
                    dni: data.dni,
                    phone: data.phone
                }),
            });

            const result = await response.json();

            if (response.ok) {
                login(result.user);
                setNotification({ message: "Perfil actualizado correctamente", type: 'success' });
            } else {
                setNotification({ message: result.error || "Error al actualizar el perfil", type: 'error' });
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            setNotification({ message: "Ocurrió un error al actualizar el perfil", type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl animate-in font-montserrat fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-8">
                <h1 className="text-2xl font-medium text-gray-900 mb-2 whitespace-nowrap">Mi Perfil</h1>
                <p className="text-sm text-gray-500">Gestiona tu información personal y contraseña.</p>
            </div>

            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
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

                    <div className="grid grid-cols-1 gap-6">
                        {/* Nombre y Apellido */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                                    Nombre
                                </label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                                    <input
                                        type="text"
                                        name="name"
                                        defaultValue={user?.name}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3.5 pl-12 pr-4 text-[13px] outline-none focus:bg-white focus:border-primary/20 transition-all font-normal"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                                    Apellido
                                </label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                                    <input
                                        type="text"
                                        name="lastName"
                                        defaultValue={user?.lastName}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3.5 pl-12 pr-4 text-[13px] outline-none focus:bg-white focus:border-primary/20 transition-all font-normal"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                                Correo Electrónico
                            </label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="email"
                                    name="email"
                                    defaultValue={user?.email}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3.5 pl-12 pr-4 text-[13px] outline-none focus:bg-white focus:border-primary/20 transition-all font-normal"
                                />
                            </div>
                        </div>

                        {/* DNI y Teléfono */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                                    DNI / CUIT
                                </label>
                                <div className="relative group">
                                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                                    <input
                                        type="text"
                                        name="dni"
                                        defaultValue={user?.dni}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3.5 pl-12 pr-4 text-[13px] outline-none focus:bg-white focus:border-primary/20 transition-all font-normal"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                                    Teléfono
                                </label>
                                <div className="relative group">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                                    <input
                                        type="text"
                                        name="phone"
                                        defaultValue={user?.phone}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3.5 pl-12 pr-4 text-[13px] outline-none focus:bg-white focus:border-primary/20 transition-all font-normal"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-gray-50 my-2" />

                        {/* Password Section */}
                        <div className="space-y-4">
                            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                                Cambiar Contraseña
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                                    <input
                                        type="password"
                                        placeholder="Nueva contraseña"
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3.5 pl-12 pr-4 text-[13px] outline-none focus:bg-white focus:border-primary/20 transition-all font-normal"
                                    />
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                                    <input
                                        type="password"
                                        placeholder="Confirmar contraseña"
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3.5 pl-12 pr-4 text-[13px] outline-none focus:bg-white focus:border-primary/20 transition-all font-normal"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-primary text-white font-medium py-3.5 px-8 rounded-2xl shadow-lg hover:shadow-primary/20 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-70 group"
                        >
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <>
                                    <Save className="h-4 w-4" />
                                    <span>Guardar cambios</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
