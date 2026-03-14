"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";

export function SessionSync() {
    const { data: session } = useSession();
    const { login, isAuthenticated, user: currentUser } = useAuthStore();

    useEffect(() => {
        if (session?.user && !isAuthenticated) {
            // Sincronizar usuario de Google con el store de Zustand
            login({
                id: (session.user as any).id || "",
                name: session.user.name || "",
                email: session.user.email || "",
                role: (session.user as any).role || "USER",
            });
        }
    }, [session, isAuthenticated, login]);

    return null;
}
