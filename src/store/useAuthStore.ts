import { signOut } from "next-auth/react";
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
    id: string;
    name: string;
    lastName?: string;
    email: string;
    role: string;
    dni?: string;
    phone?: string;
    provider?: 'credentials' | 'google';
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    login: (user: User) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            login: (user) => set({ user, isAuthenticated: true }),
            logout: async () => {
                await signOut({ redirect: false });
                set({ user: null, isAuthenticated: false });
            },
        }),
        {
            name: 'auth-storage',
        }
    )
);
