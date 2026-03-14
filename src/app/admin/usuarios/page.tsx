"use client";

import { AdminLayout } from "@/components/admin/AdminLayout";
import {
    Users,
    Search,
    User,
    Mail,
    Calendar,
    ShoppingBag,
    Shield,
    MoreVertical,
    Filter,
    ArrowUpRight,
    SearchX
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";

export default function AdminUsuariosPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user: currentUser } = useAuthStore();
    const [searchTerm, setSearchTerm] = useState("");

    const fetchUsers = async () => {
        if (!currentUser?.id) return;
        try {
            const res = await fetch(`/api/admin/users?adminId=${currentUser.id}`);
            const data = await res.json();
            if (data.users) {
                setUsers(data.users);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [currentUser?.id]);

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout>
            <div className="space-y-8 animate-in fade-in duration-700">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl font-light text-white font-montserrat tracking-tight">usuarios</h1>
                        <p className="text-white/40 text-[11px] uppercase tracking-widest">gestiona los clientes registrados</p>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white/[0.03] border border-white/5 rounded-2xl pl-11 pr-4 py-3 text-[13px] text-white focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="px-4 py-2 bg-white/[0.02] border border-white/5 rounded-2xl text-[11px] text-white/40 flex items-center gap-2">
                            <span className="text-primary font-bold">{users.length}</span> Usuarios Totales
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden mt-8">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/[0.02]">
                                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-medium">Usuario</th>
                                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-medium">Email</th>
                                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-medium">Rol</th>
                                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-medium">Pedidos</th>
                                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-medium">Unido</th>
                                    <th className="px-6 py-4 text-right"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-white/20 text-[11px] uppercase tracking-widest">
                                            Cargando usuarios...
                                        </td>
                                    </tr>
                                ) : filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center gap-2 py-8">
                                                <SearchX className="h-8 w-8 text-white/10" />
                                                <p className="text-white/20 text-[11px] uppercase tracking-widest">
                                                    No se encontraron usuarios que coincidan con la búsqueda.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredUsers.map((u) => (
                                    <tr key={u.id} className="hover:bg-white/[0.01] transition-colors group">
                                        <td className="px-6 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center border border-white/5 text-primary">
                                                    <User className="h-5 w-5" />
                                                </div>
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-[13px] font-medium text-white group-hover:text-primary transition-colors">
                                                        {u.name} {u.lastName}
                                                    </span>
                                                    {u.role === 'ADMIN' && (
                                                        <span className="text-[9px] text-primary font-bold uppercase tracking-tighter bg-primary/10 px-1.5 py-0.5 rounded w-fit">ADMIN</span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex items-center gap-2 text-[12px] text-white/60">
                                                <Mail className="h-3.5 w-3.5 opacity-30" />
                                                {u.email}
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 text-[12px] text-white/40 font-light">
                                            {u.role}
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex items-center gap-2">
                                                <ShoppingBag className="h-3.5 w-3.5 text-primary opacity-50" />
                                                <span className="text-[13px] font-bold text-white/80">{u._count.orders}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex flex-col gap-0.5 text-[11px]">
                                                <span className="text-white/40">
                                                    {new Date(u.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 text-right">
                                            <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white/20 hover:text-white">
                                                <MoreVertical className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Information Card */}
                <div className="p-6 bg-white/[0.03] border border-white/5 rounded-[32px] flex gap-4 items-start">
                    <div className="p-2 bg-primary/10 rounded-xl">
                        <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <p className="text-[12px] text-white font-medium">Gestión de Usuarios</p>
                        <p className="text-[11px] text-white/40 leading-relaxed max-w-3xl">
                            Visualiza la actividad de tus clientes registrados. Puedes buscar usuarios por nombre o correo electrónico
                            y ver rápidamente cuántos pedidos han realizado en la tienda. Próximamente podrás gestionar roles y permisos.
                        </p>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
