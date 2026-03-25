"use client";


import {
    Users,
    Search,
    User,
    Mail,
    Calendar,
    ShoppingBag,
    Shield,
    ArrowUpRight,
    SearchX,
    Key,
    CheckCircle2,
    AlertCircle,
    MoreVertical
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

    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const handleDeleteUser = async (targetId: string) => {
        if (!currentUser?.id) return;
        setIsDeleting(targetId);
        try {
            const res = await fetch(`/api/admin/users?adminId=${currentUser.id}&targetId=${targetId}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                setUsers(users.filter(u => u.id !== targetId));
                setIsDeleteModalOpen(false);
            }
        } catch (error) {
            console.error("Error deleting user:", error);
        } finally {
            setIsDeleting(null);
        }
    };

    const [userToDelete, setUserToDelete] = useState<any>(null);

    // Password Management State
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [userForPassword, setUserForPassword] = useState<any>(null);
    const [newPassword, setNewPassword] = useState("");
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
    const [passwordStatus, setPasswordStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleUpdatePassword = async () => {
        if (!currentUser?.id || !userForPassword?.id || !newPassword) return;
        setIsUpdatingPassword(true);
        setPasswordStatus('idle');
        try {
            const res = await fetch(`/api/admin/users?adminId=${currentUser.id}&targetId=${userForPassword.id}`, {
                method: 'PATCH',
                body: JSON.stringify({ password: newPassword }),
                headers: { 'Content-Type': 'application/json' }
            });
            if (res.ok) {
                setPasswordStatus('success');
                setNewPassword("");
                setTimeout(() => {
                    setIsPasswordModalOpen(false);
                    setPasswordStatus('idle');
                }, 2000);
            } else {
                setPasswordStatus('error');
            }
        } catch (error) {
            console.error("Error updating password:", error);
            setPasswordStatus('error');
        } finally {
            setIsUpdatingPassword(null as any); // Reset loading state
            setIsUpdatingPassword(false);
        }
    };

    const handleUpdateRole = async (targetId: string, newRole: string) => {
        if (!currentUser?.id) return;
        try {
            const res = await fetch(`/api/admin/users?adminId=${currentUser.id}&targetId=${targetId}`, {
                method: 'PATCH',
                body: JSON.stringify({ role: newRole }),
                headers: { 'Content-Type': 'application/json' }
            });
            if (res.ok) {
                setUsers(users.map(u => u.id === targetId ? { ...u, role: newRole } : u));
            }
        } catch (error) {
            console.error("Error updating role:", error);
        }
    };

    return (
        <>
            <div className="space-y-8 animate-in fade-in duration-700">
                {/* Delete Confirmation Modal */}
                {isDeleteModalOpen && userToDelete && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 overflow-hidden">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsDeleteModalOpen(false)} />
                        <div className="bg-[#1A1F1C] border border-white/10 w-full max-w-md rounded-[32px] p-8 relative z-10 shadow-2xl animate-in zoom-in duration-300">
                            <div className="flex flex-col items-center gap-6 text-center">
                                <div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                                    <Users className="h-8 w-8 text-red-500" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-medium text-white font-montserrat tracking-tight">¿Eliminar usuario en cascada?</h3>
                                    <p className="text-white/40 text-[13px] leading-relaxed">
                                        Estás por eliminar a <span className="text-white font-medium">{userToDelete.name} {userToDelete.lastName}</span> ({userToDelete.email}).
                                        Esta acción borrará permanentemente todos sus pedidos, direcciones, cupones y transacciones de puntos.
                                        <br /><br />
                                        <span className="text-red-400 font-bold uppercase text-[10px] tracking-widest">Esta acción no se puede deshacer.</span>
                                    </p>
                                </div>
                                <div className="flex gap-3 w-full pt-2">
                                    <button
                                        onClick={() => setIsDeleteModalOpen(false)}
                                        className="flex-1 px-6 py-3.5 rounded-2xl bg-white/5 border border-white/5 text-white/60 text-[13px] font-medium hover:bg-white/10 transition-all"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={() => handleDeleteUser(userToDelete.id)}
                                        disabled={isDeleting === userToDelete.id}
                                        className="flex-1 px-6 py-3.5 rounded-2xl bg-red-500 text-white text-[13px] font-medium hover:bg-red-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {isDeleting === userToDelete.id ? (
                                            <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            "Eliminar Todo"
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Password Reset Modal */}
                {isPasswordModalOpen && userForPassword && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 overflow-hidden">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => !isUpdatingPassword && setIsPasswordModalOpen(false)} />
                        <div className="bg-[#1A1F1C] border border-white/10 w-full max-w-md rounded-[32px] p-8 relative z-10 shadow-2xl animate-in zoom-in duration-300">
                            <div className="flex flex-col items-center gap-6 text-center">
                                <div className={`h-16 w-16 rounded-full flex items-center justify-center border transition-colors ${
                                    passwordStatus === 'success' ? 'bg-green-500/10 border-green-500/20' : 
                                    passwordStatus === 'error' ? 'bg-red-500/10 border-red-500/20' : 
                                    'bg-primary/10 border-primary/20'
                                }`}>
                                    {passwordStatus === 'success' ? (
                                        <CheckCircle2 className="h-8 w-8 text-green-500" />
                                    ) : passwordStatus === 'error' ? (
                                        <AlertCircle className="h-8 w-8 text-red-500" />
                                    ) : (
                                        <Key className="h-8 w-8 text-primary" />
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-medium text-white font-montserrat tracking-tight">Cambiar Contraseña</h3>
                                    <p className="text-white/40 text-[13px] leading-relaxed">
                                        Ingresa una nueva contraseña para <span className="text-white font-medium">{userForPassword.name} {userForPassword.lastName}</span>.
                                    </p>
                                </div>
                                
                                <div className="w-full space-y-4">
                                    <input 
                                        type="text" 
                                        placeholder="Nueva contraseña (min 6 carac.)"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-[13px] text-white focus:outline-none focus:border-primary transition-all placeholder:text-white/20"
                                        autoFocus
                                    />

                                    <div className="flex gap-3 w-full pt-2">
                                        <button
                                            onClick={() => setIsPasswordModalOpen(false)}
                                            disabled={isUpdatingPassword}
                                            className="flex-1 px-6 py-3.5 rounded-2xl bg-white/5 border border-white/5 text-white/60 text-[13px] font-medium hover:bg-white/10 transition-all disabled:opacity-50"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={handleUpdatePassword}
                                            disabled={isUpdatingPassword || newPassword.length < 6}
                                            className="flex-1 px-6 py-3.5 rounded-2xl bg-primary text-white text-[13px] font-medium hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            {isUpdatingPassword ? (
                                                <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                "Actualizar"
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

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
                                        <td className="px-6 py-6">
                                            <select 
                                                value={u.role}
                                                onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                                                className={`
                                                    bg-white/[0.03] border border-white/5 rounded-lg px-2 py-1 text-[11px] font-medium outline-none transition-all
                                                    ${u.role === 'ADMIN' ? 'text-primary border-primary/20' : 
                                                      u.role === 'TEST' ? 'text-amber-400 border-amber-400/20' : 
                                                      'text-white/40 border-white/10'}
                                                `}
                                            >
                                                <option value="USER" className="bg-[#1A1F1C] text-white/60">CLIENTE</option>
                                                <option value="ADMIN" className="bg-[#1A1F1C] text-primary">ADMIN</option>
                                                <option value="TEST" className="bg-[#1A1F1C] text-amber-400">TESTER</option>
                                            </select>
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
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => {
                                                        setUserForPassword(u);
                                                        setIsPasswordModalOpen(true);
                                                        setPasswordStatus('idle');
                                                    }}
                                                    className="p-2 hover:bg-primary/10 rounded-lg transition-colors text-white/20 hover:text-primary"
                                                    title="Blanquear contraseña"
                                                >
                                                    <Key className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setUserToDelete(u);
                                                        setIsDeleteModalOpen(true);
                                                    }}
                                                    className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-white/20 hover:text-red-500 group/delete"
                                                    title="Eliminar usuario y toda su actividad"
                                                >
                                                    <MoreVertical className="h-4 w-4" />
                                                </button>
                                            </div>
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
        </>
    );
}
