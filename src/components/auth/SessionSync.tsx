"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";

export function SessionSync() {
    const { data: session, status } = useSession();
    const { user, login, logout, isAuthenticated } = useAuthStore();

    useEffect(() => {
        if (status === 'loading') return;

        if (session?.user) {
            if (!isAuthenticated) {
                // Sincronizar usuario de Google con el store de Zustand
                login({
                    id: (session.user as any).id || "",
                    name: session.user.name || "",
                    email: session.user.email || "",
                    role: (session.user as any).role || "USER",
                    provider: 'google'
                });
            }
        } else if (isAuthenticated && user?.provider === 'google') {
            // Solo cerramos sesión automáticamente si el usuario era de Google
            // y la sesión de NextAuth ya no existe.
            logout();
        }
    }, [session, status, isAuthenticated, user?.provider, login, logout]);

    return null;
}
