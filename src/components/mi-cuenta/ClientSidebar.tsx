"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, ShoppingBag, MapPin, LogOut, Coins, Ticket } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";

const menuItems = [
    { name: "Resumen", href: "/mi-cuenta", icon: User },
    { name: "Mis Pedidos", href: "/mi-cuenta/pedidos", icon: ShoppingBag },
    { name: "Mis Puntos", href: "/mi-cuenta/puntos", icon: Coins },
    { name: "Mis Cupones", href: "/mi-cuenta/cupones", icon: Ticket },
    { name: "Direcciones", href: "/mi-cuenta/direcciones", icon: MapPin },
    { name: "Perfil", href: "/mi-cuenta/perfil", icon: User },
];

export const ClientSidebar = () => {
    const pathname = usePathname();
    const { logout } = useAuthStore();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push("/");
    };

    return (
        <aside className="w-full md:w-64 space-y-2">
            <div className="bg-white rounded-[24px] border border-gray-100 p-6 shadow-sm">
                <nav className="space-y-1">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] transition-all ${isActive
                                    ? "bg-primary/5 text-primary font-medium border border-primary/10"
                                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                                    }`}
                            >
                                <Icon className={`h-4 w-4 ${isActive ? "text-primary" : "text-gray-400"}`} />
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="mt-8 pt-6 border-t border-gray-100">
                    <button
                        onClick={async () => {
                            if (useAuthStore.getState().user?.provider === 'google') {
                                const { signOut } = await import("next-auth/react");
                                signOut({ callbackUrl: "/" });
                            } else {
                                logout();
                                router.push("/");
                            }
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] text-red-500 hover:bg-red-50 transition-all font-medium cursor-pointer"
                    >
                        <LogOut className="h-4 w-4 pointer-events-none" />
                        <span className="pointer-events-none">Cerrar sesión</span>
                    </button>
                </div>
            </div>
        </aside>
    );
};
