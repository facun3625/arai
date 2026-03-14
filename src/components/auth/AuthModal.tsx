"use client";

import { useState, useEffect } from "react";
import { Mail, Lock, X, User, ArrowRight, Loader2, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";

type AuthView = "login" | "register" | "forgot";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialView?: AuthView;
}

export const AuthModal = ({ isOpen, onClose, initialView = "login" }: AuthModalProps) => {
    const [view, setView] = useState<AuthView>(initialView);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showContent, setShowContent] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setView(initialView);
            setError(null);
            document.body.style.overflow = "hidden";
            const timer = setTimeout(() => setShowContent(true), 10);
            return () => clearTimeout(timer);
        } else {
            setShowContent(false);
            document.body.style.overflow = "unset";
        }
    }, [isOpen, initialView]);

    const { login } = useAuthStore();

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.target as HTMLFormElement);
        // const data = Object.fromEntries(formData); // No longer needed as we use formData.get directly

        try {
            let endpoint: string;
            let payload: any;

            if (view === 'register') {
                const name = formData.get('name');
                const lastName = formData.get('lastName');
                payload = {
                    email: formData.get('email'),
                    password: formData.get('password'),
                    name,
                    lastName
                };
                endpoint = '/api/auth/register';
            } else { // login or forgot
                payload = {
                    email: formData.get('email'),
                    password: formData.get('password')
                };
                endpoint = "/api/auth/login"; // Assuming forgot will be handled separately or has a different endpoint
            }

            const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (!response.ok) {
                setError(result.error || "Error al iniciar sesión");
                setIsLoading(false);
                return;
            }

            console.log("Login exitoso:", result.user);
            login(result.user);
            onClose();
            setIsLoading(false);
        } catch (error) {
            console.error("Login error:", error);
            setError("Ocurrió un error inesperado. Por favor, intenta de nuevo.");
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 overflow-hidden">
            {/* Backdrop sutil con blur */}
            <div
                className={`absolute inset-0 bg-black/40 backdrop-blur-md transition-all duration-700 ease-out z-0 ${showContent ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
            />

            {/* Modal Content - Fondo Verde Marca y más compacto */}
            <div className={`
                bg-primary text-white w-full max-w-[420px] rounded-[44px] shadow-[0_40px_120px_-20px_rgba(0,0,0,0.5)] 
                relative z-10 overflow-hidden font-montserrat
                transition-all duration-700 cubic-bezier(0.19, 1, 0.22, 1)
                ${showContent ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-24 scale-95 opacity-0'}
            `}>

                {/* Close Button - Blanco sutil */}
                <button
                    onClick={onClose}
                    className="absolute top-8 right-8 text-white/40 hover:text-white transition-all p-2 hover:bg-white/10 rounded-full z-20"
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="p-10 pt-12 md:px-12 md:pb-12 md:pt-16">
                    {/* Header Compacto */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-[28px] mb-6 border border-white/5">
                            <img
                                src="/arai_logo.png"
                                alt="Araí"
                                className="h-8 w-auto brightness-0 invert"
                            />
                        </div>
                        <h2 className="text-[24px] font-medium text-white leading-tight">
                            {view === "login" ? "¡Hola de nuevo!" : view === "register" ? "Crea tu cuenta" : "Recuperar acceso"}
                        </h2>
                    </div>

                    {/* Forms con inputs delicados - Sin tracking como se pidió */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <AnimatePresence mode="wait">
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="bg-red-500/10 border border-red-500/20 rounded-[20px] p-4 text-xs text-red-400 flex items-center gap-3"
                                >
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="flex flex-col gap-4">
                            {view === "register" && (
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="relative group">
                                        <User className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 group-focus-within:text-white transition-colors duration-300" />
                                        <input
                                            type="text"
                                            name="name"
                                            placeholder="Nombre"
                                            required
                                            className="w-full bg-white/5 border border-white/10 rounded-[20px] py-4 pl-12 pr-6 text-sm text-white focus:bg-white/10 focus:border-white/20 outline-none transition-all duration-300 font-normal placeholder:text-white/20"
                                        />
                                    </div>
                                    <div className="relative group">
                                        <User className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 group-focus-within:text-white transition-colors duration-300" />
                                        <input
                                            type="text"
                                            name="lastName"
                                            placeholder="Apellido"
                                            required
                                            className="w-full bg-white/5 border border-white/10 rounded-[20px] py-4 pl-12 pr-6 text-sm text-white focus:bg-white/10 focus:border-white/20 outline-none transition-all duration-300 font-normal placeholder:text-white/20"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="relative group">
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 group-focus-within:text-white transition-colors duration-300" />
                                <input
                                    type="text"
                                    name="email"
                                    placeholder="Email o Usuario"
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-[20px] py-4 pl-12 pr-6 text-sm text-white focus:bg-white/10 focus:border-white/20 outline-none transition-all duration-300 font-normal placeholder:text-white/20"
                                />
                            </div>

                            {view !== "forgot" && (
                                <div className="relative group">
                                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 group-focus-within:text-white transition-colors duration-300" />
                                    <input
                                        type="password"
                                        name="password"
                                        placeholder="Contraseña"
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-[20px] py-4 pl-12 pr-6 text-sm text-white focus:bg-white/10 focus:border-white/20 outline-none transition-all duration-300 font-normal placeholder:text-white/20"
                                    />
                                </div>
                            )}
                        </div>

                        {view === "login" && (
                            <div className="text-center mt-2">
                                <button
                                    type="button"
                                    onClick={() => setView("forgot")}
                                    className="text-[10px] text-white/30 font-medium hover:text-white transition-colors"
                                >
                                    ¿Olvidaste tu contraseña?
                                </button>
                            </div>
                        )}

                        {/* Botón más chico y centrado */}
                        <div className="flex justify-center mt-8">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="min-w-[180px] bg-white text-primary font-medium py-3.5 px-8 rounded-[20px] shadow-lg hover:shadow-white/10 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 text-[13px] flex items-center justify-center gap-2 disabled:opacity-70 group"
                            >
                                {isLoading ? (
                                    <div className="h-5 w-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <span>{view === "login" ? "Iniciar Sesión" : view === "register" ? "Crear Cuenta" : "Enviar Email"}</span>
                                        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Footer Links - Sin negritas, sin líneas divisorias, centrado */}
                    <div className="mt-12 text-center">
                        <div className="text-[11px] text-white/30 font-normal">
                            {view === "login" ? (
                                <div className="flex flex-col items-center gap-6">
                                    <div className="w-full flex items-center gap-4 text-white/10">
                                        <div className="h-px flex-1 bg-current" />
                                        <span className="text-[10px] uppercase tracking-widest text-white/30">o continua con</span>
                                        <div className="h-px flex-1 bg-current" />
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsLoading(true);
                                            import('next-auth/react').then(({ signIn }) => {
                                                signIn('google', { redirect: false }).then(async (res) => {
                                                    if (res?.error) {
                                                        setError("Error al conectar con Google");
                                                    } else {
                                                        // El redireccionamiento o el sync de sesión se manejará globalmente 
                                                        // o mediante un componente de sesión
                                                        onClose();
                                                    }
                                                    setIsLoading(false);
                                                });
                                            });
                                        }}
                                        className="w-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white py-3.5 px-6 rounded-[20px] transition-all flex items-center justify-center gap-3 group text-[13px]"
                                    >
                                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.38-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                        </svg>
                                        Continuar con Google
                                    </button>

                                    <div className="w-12 h-px bg-white/5" />
                                    <p>
                                        ¿Nuevo en Araí?{" "}
                                        <button
                                            onClick={() => {
                                                setView("register");
                                                setError(null);
                                            }}
                                            className="text-white font-medium hover:underline transition-all ml-1"
                                        >
                                            Crear cuenta
                                        </button>
                                    </p>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setView("login")}
                                    className="text-white/50 hover:text-white font-medium flex items-center justify-center gap-2 w-full transition-all duration-300 group"
                                >
                                    <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-1" />
                                    <span>Volver</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
