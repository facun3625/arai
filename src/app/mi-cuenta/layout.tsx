"use client";

import { ClientSidebar } from "@/components/mi-cuenta/ClientSidebar";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export default function MiCuentaLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isAuthenticated, user } = useAuthStore();
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        // Redirigir si no está autenticado
        if (!isAuthenticated) {
            router.push("/");
        } else {
            setIsChecking(false);
        }
    }, [isAuthenticated, router]);

    if (isChecking) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 lg:px-8 pt-10 pb-20">
            <div className="flex flex-col md:flex-row gap-8">
                <ClientSidebar />
                <main className="flex-1 min-w-0">
                    {children}
                </main>
            </div>
        </div>
    );
}
