"use client";

import { MapPin, Plus, Trash2, Loader2, CheckCircle2, Home, Edit3, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { motion, AnimatePresence } from "framer-motion";

interface Address {
    id: string;
    street: string;
    number: string;
    apartment: string | null;
    city: string;
    province: string;
    zipCode: string;
    dni: string | null;
    phone: string | null;
    isDefault: boolean;
}

export default function DireccionesPage() {
    const { user } = useAuthStore();
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [notifications, setNotifications] = useState<{ id: number; message: string; type: 'success' | 'error' }[]>([]);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Partial<Address> | null>(null);

    const addNotification = (message: string, type: 'success' | 'error' = 'success') => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 3000);
    };

    const fetchAddresses = async () => {
        if (!user?.id) return;
        try {
            const res = await fetch(`/api/user/address?userId=${user.id}`);
            const data = await res.json();
            if (data.addresses) setAddresses(data.addresses);
        } catch (error) {
            console.error("Fetch addresses error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAddresses();
    }, [user?.id]);

    const handleDelete = async (e: React.MouseEvent, addressId: string) => {
        e.preventDefault();
        e.stopPropagation();

        if (confirmDeleteId !== addressId) {
            setConfirmDeleteId(addressId);
            return;
        }

        setConfirmDeleteId(null);
        setIsDeleting(addressId);
        try {
            const res = await fetch(`/api/user/address/${addressId}`, {
                method: 'DELETE'
            });

            const data = await res.json();
            if (res.ok) {
                setAddresses(prev => prev.filter(a => a.id !== addressId));
                addNotification("Dirección eliminada correctamente");
            } else {
                addNotification(data.error || "Error al eliminar la dirección", "error");
            }
        } catch (error: any) {
            console.error("Delete fetch error:", error);
            addNotification("Error de conexión", "error");
        } finally {
            setIsDeleting(null);
        }
    };

    const handleSetDefault = async (addressId: string) => {
        if (!user?.id) return;
        try {
            const res = await fetch(`/api/user/address/${addressId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, isDefault: true })
            });

            if (res.ok) {
                setAddresses(prev => prev.map(a => ({
                    ...a,
                    isDefault: a.id === addressId
                })));
                addNotification("Dirección principal actualizada");
            } else {
                addNotification("Error al actualizar la dirección", "error");
            }
        } catch (error) {
            addNotification("Error de conexión", "error");
        }
    };

    const openEditModal = (address?: Address) => {
        setEditingAddress(address || {
            street: "",
            number: "",
            apartment: "",
            city: "",
            province: "",
            zipCode: "",
            dni: "",
            phone: "",
            isDefault: false
        });
        setIsModalOpen(true);
    };

    const handleSaveAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.id || !editingAddress) return;

        setIsSaving(true);
        try {
            const isEditing = 'id' in editingAddress;
            const url = isEditing ? `/api/user/address/${editingAddress.id}` : '/api/user/address';
            const method = isEditing ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...editingAddress,
                    userId: user.id,
                    // Ensure nulls for empty strings
                    apartment: editingAddress.apartment || null,
                    dni: editingAddress.dni || null,
                    phone: editingAddress.phone || null
                })
            });

            if (res.ok) {
                addNotification(isEditing ? "Dirección actualizada" : "Dirección guardada");
                fetchAddresses();
                setIsModalOpen(false);
            } else {
                addNotification("Error al guardar la dirección", "error");
            }
        } catch (error) {
            addNotification("Error de conexión", "error");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                <Loader2 className="h-8 w-8 text-gray-200 animate-spin mb-4" />
                <p className="text-gray-400 text-sm">Cargando tus direcciones...</p>
            </div>
        );
    }

    return (
        <div className="animate-in font-montserrat fade-in slide-in-from-bottom-4 duration-700 max-w-4xl">
            {/* Notifications */}
            <div className="fixed top-24 right-8 z-[110] flex flex-col gap-3 pointer-events-none">
                <AnimatePresence>
                    {notifications.map((n) => (
                        <motion.div
                            key={n.id}
                            initial={{ opacity: 0, x: 20, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                            className={`px-6 py-4 rounded-[20px] shadow-2xl border flex items-center gap-3 min-w-[300px] pointer-events-auto backdrop-blur-md ${n.type === 'success'
                                ? 'bg-white/90 border-emerald-100 text-emerald-900'
                                : 'bg-red-50 border-red-100 text-red-900'
                                }`}
                        >
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${n.type === 'success' ? 'bg-emerald-100' : 'bg-red-100'
                                }`}>
                                {n.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
                            </div>
                            <p className="text-xs font-bold uppercase tracking-widest">{n.message}</p>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Modal Edit/Add */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden p-8 md:p-12"
                        >
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="absolute top-8 right-8 h-10 w-10 flex items-center justify-center rounded-full hover:bg-gray-50 text-gray-400 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>

                            <h2 className="text-2xl font-medium text-gray-900 mb-8">
                                {editingAddress && 'id' in editingAddress ? 'Editar Dirección' : 'Nueva Dirección'}
                            </h2>

                            <form onSubmit={handleSaveAddress} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="col-span-full">
                                        <input
                                            type="text"
                                            placeholder="Calle / Avenida *"
                                            required
                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                            value={editingAddress?.street || ""}
                                            onChange={(e) => setEditingAddress({ ...editingAddress, street: e.target.value })}
                                        />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Número *"
                                        required
                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        value={editingAddress?.number || ""}
                                        onChange={(e) => setEditingAddress({ ...editingAddress, number: e.target.value })}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Piso / Depto"
                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        value={editingAddress?.apartment || ""}
                                        onChange={(e) => setEditingAddress({ ...editingAddress, apartment: e.target.value })}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Código Postal *"
                                        required
                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        value={editingAddress?.zipCode || ""}
                                        onChange={(e) => setEditingAddress({ ...editingAddress, zipCode: e.target.value })}
                                    />
                                    <div className="col-span-full md:col-span-2">
                                        <input
                                            type="text"
                                            placeholder="Ciudad *"
                                            required
                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                            value={editingAddress?.city || ""}
                                            onChange={(e) => setEditingAddress({ ...editingAddress, city: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-span-full md:col-span-1">
                                        <select
                                            required
                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-gray-700 appearance-none"
                                            value={editingAddress?.province || ""}
                                            onChange={(e) => setEditingAddress({ ...editingAddress, province: e.target.value })}
                                        >
                                            <option value="" disabled>Provincia *</option>
                                            <option value="Misiones">Misiones</option>
                                            <option value="Buenos Aires">Buenos Aires</option>
                                            <option value="CABA">CABA</option>
                                            <option value="Santa Fe">Santa Fe</option>
                                            <option value="Córdoba">Córdoba</option>
                                            <option value="Corrientes">Corrientes</option>
                                            <option value="Chaco">Chaco</option>
                                        </select>
                                    </div>
                                    <div className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <input
                                            type="text"
                                            placeholder="DNI / CUIT"
                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                            value={editingAddress?.dni || ""}
                                            onChange={(e) => setEditingAddress({ ...editingAddress, dni: e.target.value })}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Teléfono"
                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                            value={editingAddress?.phone || ""}
                                            onChange={(e) => setEditingAddress({ ...editingAddress, phone: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 py-2">
                                    <input
                                        type="checkbox"
                                        id="modalDefault"
                                        className="w-5 h-5 rounded-lg border-gray-200 text-primary focus:ring-primary"
                                        checked={editingAddress?.isDefault || false}
                                        onChange={(e) => setEditingAddress({ ...editingAddress, isDefault: e.target.checked })}
                                    />
                                    <label htmlFor="modalDefault" className="text-sm font-medium text-gray-600 cursor-pointer select-none">Establecer como dirección principal</label>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 py-4 px-6 border border-gray-100 rounded-2xl text-gray-500 font-medium text-sm hover:bg-gray-50 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="flex-1 py-4 px-6 bg-primary text-white rounded-2xl font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 hover:shadow-xl transition-all disabled:opacity-50"
                                    >
                                        {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Guardar Cambios'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-medium text-gray-900 mb-2">Mis Direcciones</h1>
                    <p className="text-sm text-gray-500">Gestiona tus puntos de entrega para un checkout más rápido.</p>
                </div>
                <button
                    onClick={() => openEditModal()}
                    className="flex items-center justify-center gap-2 bg-[#0c120e] text-white font-medium py-3.5 px-6 rounded-2xl shadow-lg hover:shadow-black/10 transition-all text-sm self-start group"
                >
                    <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
                    Nueva Dirección
                </button>
            </div>

            {addresses.length === 0 ? (
                <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-16 text-center">
                    <div className="bg-gray-50 h-24 w-24 rounded-full flex items-center justify-center mx-auto mb-6">
                        <MapPin className="h-10 w-10 text-gray-200" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Sin direcciones guardadas</h3>
                    <p className="text-gray-400 text-sm mb-8 max-w-xs mx-auto">
                        Guarda tus direcciones de envío para no tener que ingresarlas en cada compra.
                    </p>
                    <button
                        onClick={() => openEditModal()}
                        className="text-primary font-bold text-xs uppercase tracking-widest hover:underline"
                    >
                        Empezar ahora
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                    {addresses.map((address) => (
                        <div
                            key={address.id}
                            className={`bg-white rounded-[40px] p-8 border transition-all group relative overflow-hidden ${address.isDefault ? 'border-primary/20 shadow-xl shadow-emerald-50 ring-1 ring-primary/5' : 'border-gray-50 shadow-sm hover:border-primary/10 hover:shadow-md'
                                }`}
                        >
                            {address.isDefault && (
                                <div className="absolute top-0 right-0 bg-primary text-white text-[9px] font-bold uppercase tracking-[0.2em] px-5 py-2 rounded-bl-3xl">
                                    Principal
                                </div>
                            )}

                            <div className="flex items-start gap-4 mb-8">
                                <div className="h-14 w-14 bg-gray-50 rounded-[20px] flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                                    <Home className="h-6 w-6" />
                                </div>
                                <div className="min-w-0 pr-10">
                                    <p className="text-lg font-bold text-gray-900 truncate tracking-tight">
                                        {address.street} {address.number}
                                        {address.apartment && <span className="text-gray-400 font-medium">, {address.apartment}</span>}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1 uppercase tracking-[0.15em] font-medium">
                                        {address.city}, {address.province}
                                    </p>
                                </div>

                                <button
                                    onClick={() => openEditModal(address)}
                                    className="absolute top-8 right-6 h-10 w-10 flex items-center justify-center text-gray-300 hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <Edit3 className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="space-y-4 pb-8 border-b border-gray-50/50">
                                <div className="flex items-center gap-3 text-xs">
                                    <span className="font-bold text-gray-400 grow opacity-50 uppercase tracking-[0.1em]">Código Postal</span>
                                    <span className="font-semibold text-gray-700">{address.zipCode}</span>
                                </div>
                                {address.dni && (
                                    <div className="flex items-center gap-3 text-xs">
                                        <span className="font-bold text-gray-400 grow opacity-50 uppercase tracking-[0.1em]">DNI</span>
                                        <span className="font-semibold text-gray-700">{address.dni}</span>
                                    </div>
                                )}
                                {address.phone && (
                                    <div className="flex items-center gap-3 text-xs">
                                        <span className="font-bold text-gray-400 grow opacity-50 uppercase tracking-[0.1em]">Teléfono</span>
                                        <span className="font-semibold text-gray-700">{address.phone}</span>
                                    </div>
                                )}
                            </div>

                            <div className="pt-8 flex items-center justify-between">
                                {!address.isDefault ? (
                                    <button
                                        onClick={() => handleSetDefault(address.id)}
                                        className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary hover:text-primary/70 transition-colors flex items-center gap-2"
                                    >
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        Establecer Principal
                                    </button>
                                ) : (
                                    <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-500 flex items-center gap-2">
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        Predeterminada
                                    </div>
                                )}

                                <div className="flex gap-2 items-center">
                                    <AnimatePresence mode="wait">
                                        {confirmDeleteId === address.id ? (
                                            <motion.div
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 20 }}
                                                className="flex items-center gap-2 bg-red-50 p-1 rounded-xl"
                                            >
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setConfirmDeleteId(null);
                                                    }}
                                                    className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-gray-700"
                                                >
                                                    Cancelar
                                                </button>
                                                <button
                                                    onClick={(e) => handleDelete(e, address.id)}
                                                    disabled={isDeleting === address.id}
                                                    className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-sm hover:bg-red-600 disabled:opacity-50 flex items-center gap-1"
                                                >
                                                    {isDeleting === address.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Confirmar"}
                                                </button>
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="flex gap-2"
                                            >
                                                <button
                                                    onClick={() => openEditModal(address)}
                                                    className="md:hidden h-10 w-10 flex items-center justify-center text-gray-300 hover:text-primary hover:bg-gray-50 rounded-xl transition-all"
                                                >
                                                    <Edit3 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={(e) => handleDelete(e, address.id)}
                                                    disabled={isDeleting === address.id}
                                                    className="h-10 w-10 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
