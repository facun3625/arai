"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { Loader2, ArrowLeft } from "lucide-react";

export const AdminLayout = ({ children }: { children: React.ReactNode }) => {
    const { user, isAuthenticated } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();
    const [isChecking, setIsChecking] = useState(true);
    const [hasHydrated, setHasHydrated] = useState(false);

    const handleBack = () => {
        if (window.history.length > 2) {
            router.back();
        } else {
            router.push("/admin/dashboard");
        }
    };

    // Wait for hydration of the persisted store
    useEffect(() => {
        setHasHydrated(true);
    }, []);

    useEffect(() => {
        if (!hasHydrated) return;

        if (!isAuthenticated || user?.role !== 'ADMIN') {
            router.push("/");
        } else {
            setIsChecking(false);
        }
    }, [isAuthenticated, user, router, hasHydrated]);

    if (isChecking) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-[#0c120e] text-white">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-[#050806]">
            <AdminSidebar />
            <main className="flex-1 overflow-y-auto min-h-screen">
                <div className="p-8 md:p-12 max-w-7xl mx-auto">
                    {pathname !== "/admin/dashboard" && (
                        <button
                            onClick={handleBack}
                            className="flex items-center gap-2 text-white/40 hover:text-white text-[11px] uppercase tracking-widest mb-8 transition-colors group"
                        >
                            <div className="bg-white/5 p-1.5 rounded-full group-hover:bg-white/10 transition-colors">
                                <ArrowLeft className="h-3 w-3" />
                            </div>
                            volver
                        </button>
                    )}
                    {children}
                </div>
            </main>
        </div>
    );
};
