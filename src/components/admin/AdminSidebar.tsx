"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    BarChart3,
    ArrowLeft,
    LogOut,
    User,
    Layers,
    Settings2,
    Tag,
    ChevronDown,
    Folder
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import Image from "next/image";

type MenuItem = { name: string; href: string; icon: any };
type MenuGroup = { type: 'group'; title: string; icon: any; items: MenuItem[] };
type MenuNode = MenuItem | MenuGroup;

const menuItems: MenuNode[] = [
    { name: "dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    {
        type: 'group',
        title: 'catálogo',
        icon: Folder,
        items: [
            { name: "productos", href: "/admin/productos", icon: Package },
            { name: "categorías", href: "/admin/categorias", icon: Layers },
            { name: "atributos", href: "/admin/atributos", icon: Settings2 },
        ]
    },
    {
        type: 'group',
        title: 'marketing',
        icon: Tag,
        items: [
            { name: "configuración", href: "/admin/marketing", icon: Settings2 },
            { name: "suscriptores", href: "/admin/marketing/suscriptores", icon: User },
        ]
    },
    { name: "pedidos", href: "/admin/pedidos", icon: ShoppingCart },
    { name: "usuarios", href: "/admin/usuarios", icon: User },
    { name: "estadísticas", href: "/admin/estadisticas", icon: BarChart3 },
];

export const AdminSidebar = () => {
    const pathname = usePathname();
    const { user, logout } = useAuthStore();
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
        'catálogo': true // Default open
    });

    const toggleGroup = (title: string) => {
        setOpenGroups(prev => ({
            ...prev,
            [title]: !prev[title]
        }));
    };

    const [stats, setStats] = useState<{ Pending: number; Processing: number }>({ Pending: 0, Processing: 0 });

    const fetchStats = async () => {
        if (!user?.id) return;
        try {
            const res = await fetch(`/api/admin/orders/stats?adminId=${user.id}`);
            const data = await res.json();
            if (data && !data.error) {
                setStats(data);
            }
        } catch (error) {
            console.error("Error fetching sidebar stats:", error);
        }
    };

    useEffect(() => {
        fetchStats();

        const handleRefresh = () => fetchStats();
        window.addEventListener('refreshAdminStats', handleRefresh);

        // Refresh stats every 30 seconds for real-time feel
        const interval = setInterval(fetchStats, 30000);

        return () => {
            clearInterval(interval);
            window.removeEventListener('refreshAdminStats', handleRefresh);
        };
    }, [user?.id]);

    return (
        <aside className="w-64 bg-[#0c120e] text-white/90 flex flex-col h-screen sticky top-0 border-r border-white/5 font-montserrat">
            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 mt-8">
                {menuItems.map((node, i) => {
                    if ('type' in node && node.type === 'group') {
                        const isOpen = openGroups[node.title];
                        const isAnyChildActive = node.items.some(item => pathname === item.href);
                        const GroupIcon = node.icon;

                        return (
                            <div key={i} className="pt-1 pb-1">
                                <button
                                    onClick={() => toggleGroup(node.title)}
                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-[11px] transition-all group cursor-pointer ${isAnyChildActive ? "bg-white/5 text-white" : "hover:bg-white/5 text-white/60 hover:text-white"
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <GroupIcon className={`h-4 w-4 ${isAnyChildActive ? "text-white" : "text-primary group-hover:text-white transition-colors"}`} />
                                        <span className="capitalize">{node.title}</span>
                                    </div>
                                    <ChevronDown className={`h-4 w-4 transition-all duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                                </button>

                                <div className={`space-y-1 overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-64 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
                                    {node.items.map((item) => {
                                        const isActive = pathname === item.href;
                                        const Icon = item.icon;
                                        return (
                                            <Link
                                                key={item.name}
                                                href={item.href}
                                                className={`flex items-center gap-3 pl-11 pr-4 py-2.5 rounded-xl text-[10.5px] transition-all group ${isActive
                                                    ? "bg-primary/20 text-primary font-medium"
                                                    : "hover:bg-white/5 text-white/50 hover:text-white"
                                                    }`}
                                            >
                                                <Icon className={`h-3.5 w-3.5 ${isActive ? "text-primary" : "text-white/40 group-hover:text-white transition-colors"}`} />
                                                <span className="capitalize">{item.name}</span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    }

                    const item = node as MenuItem;
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    const isOrders = item.href === "/admin/pedidos";

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center justify-between px-4 py-3 rounded-xl text-[11px] transition-all group ${isActive
                                ? "bg-primary text-white shadow-lg shadow-primary/20"
                                : "hover:bg-white/5 text-white/60 hover:text-white"
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-primary group-hover:text-white transition-colors"}`} />
                                <span className="capitalize">{item.name}</span>
                            </div>

                            {isOrders && (stats.Pending > 0 || stats.Processing > 0) && (
                                <div className="flex items-center gap-1.5 animate-in zoom-in duration-300">
                                    {stats.Pending > 0 && (
                                        <span className="bg-orange-500 text-white min-w-[18px] h-[18px] px-1 rounded-full text-[9px] font-bold flex items-center justify-center shadow-lg shadow-orange-500/20">
                                            {stats.Pending}
                                        </span>
                                    )}
                                    {stats.Processing > 0 && (
                                        <span className="bg-blue-500 text-white min-w-[18px] h-[18px] px-1 rounded-full text-[9px] font-bold flex items-center justify-center shadow-lg shadow-blue-500/20">
                                            {stats.Processing}
                                        </span>
                                    )}
                                </div>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* User Area */}
            <div className="p-4 border-t border-white/5 space-y-2">
                <div className="flex items-center gap-3 px-4 py-3">
                    <div className="bg-white/10 p-2 rounded-full border border-white/10">
                        <User className="h-4 w-4 text-white" />
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-[11px] font-medium text-white truncate">{user?.name}</p>
                        <p className="text-[9px] text-white/40 uppercase tracking-tighter">administrador</p>
                    </div>
                </div>

                <Link
                    href="/"
                    className="flex items-center gap-3 px-4 py-2 text-[10px] text-white/60 hover:text-white transition-colors"
                >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    volver a la tienda
                </Link>

                <button
                    onClick={() => logout()}
                    className="w-full flex items-center gap-3 px-4 py-2 text-[10px] text-red-400/60 hover:text-red-400 hover:bg-red-400/5 rounded-lg transition-all"
                >
                    <LogOut className="h-3.5 w-3.5" />
                    cerrar sesión
                </button>
            </div>
        </aside>
    );
};
