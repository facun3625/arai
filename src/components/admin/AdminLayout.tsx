"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { Loader2, ArrowLeft, Menu } from "lucide-react";
import { AdminUtilsProvider } from "./AdminUtilsProvider";

export const AdminLayout = ({ children }: { children: React.ReactNode }) => {
    const { user, isAuthenticated } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();
    const [isChecking, setIsChecking] = useState(true);
    const [hasHydrated, setHasHydrated] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Close the mobile sidebar whenever the route changes
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [pathname]);

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
            <div className="h-screen w-screen flex items-center justify-center bg-white text-slate-900">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <AdminUtilsProvider>
            <div className="admin-day flex min-h-screen bg-slate-50 text-slate-900">
                <AdminSidebar mobileOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
                <div className="flex-1 flex flex-col min-w-0">
                    {/* Mobile top bar with menu toggle */}
                    <div className="lg:hidden sticky top-0 z-50 flex items-center gap-3 bg-white border-b border-slate-200 px-4 py-3">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            aria-label="Abrir menú"
                            className="text-slate-900 p-1.5 hover:bg-slate-50 rounded-lg transition-colors"
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                        <span className="text-slate-900 font-montserrat text-sm font-light tracking-tight">Panel Admin</span>
                    </div>
                    <main className="flex-1 overflow-y-auto min-h-screen">
                        <div className="w-full min-w-0 px-4 py-6 sm:px-6 lg:px-8">
                            {pathname !== "/admin/dashboard" && (
                                <button
                                    onClick={handleBack}
                                    className="flex items-center gap-2 text-slate-600 hover:text-slate-900 text-[11px] uppercase tracking-widest mb-8 transition-colors group"
                                >
                                    <div className="bg-slate-50 p-1.5 rounded-full group-hover:bg-slate-50 transition-colors">
                                        <ArrowLeft className="h-3 w-3" />
                                    </div>
                                    volver
                                </button>
                            )}
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </AdminUtilsProvider>
    );
}
