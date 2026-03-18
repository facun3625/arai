"use client";

import { useState, useEffect } from "react";
import { 
    MapPin, 
    Plus, 
    Trash2, 
    AlertCircle, 
    Truck, 
    Ban, 
    Search,
    Store,
    Phone,
    Copy,
    Save,
    MapPinOff
} from "lucide-react";

type RestrictionType = 'BLOCK_SALE' | 'BLOCK_SHIPPING';

interface Restriction {
    id: string;
    zipCode: string;
    type: RestrictionType;
    message?: string;
    address?: string;
    phone?: string;
}

export default function ZonasRestringidasPage() {
    const [restrictions, setRestrictions] = useState<Restriction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    
    // Form state
    const [newZip, setNewZip] = useState("");
    const [newType, setNewType] = useState<RestrictionType>('BLOCK_SALE');
    const [newMessage, setNewMessage] = useState("");
    const [newAddress, setNewAddress] = useState("");
    const [newPhone, setNewPhone] = useState("");

    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    const showToast = (message: string, type: "success" | "error" = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    };

    const fetchRestrictions = async () => {
        try {
            const res = await fetch("/api/settings/restrictions");
            const data = await res.json();
            if (Array.isArray(data)) {
                setRestrictions(data);
            }
        } catch (error) {
            console.error("Error fetching restrictions:", error);
            showToast("Error al cargar zonas", "error");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRestrictions();
    }, []);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newZip) return;
        
        setIsSaving(true);
        try {
            const res = await fetch("/api/settings/restrictions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    zipCode: newZip,
                    type: newType,
                    message: newMessage,
                    address: newAddress,
                    phone: newPhone
                })
            });

            if (res.ok) {
                showToast("Zona agregada correctamente");
                setNewZip("");
                setNewMessage("");
                setNewAddress("");
                setNewPhone("");
                fetchRestrictions();
            } else {
                showToast("Error al guardar la zona", "error");
            }
        } catch (error) {
            showToast("Error de conexión", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("¿Eliminar esta restricción?")) return;
        
        try {
            const res = await fetch(`/api/settings/restrictions?id=${id}`, {
                method: "DELETE"
            });
            if (res.ok) {
                showToast("Zona eliminada");
                fetchRestrictions();
            }
        } catch (error) {
            showToast("Error al eliminar", "error");
        }
    };

    const filtered = restrictions.filter(r => 
        r.zipCode.includes(searchTerm) || 
        r.address?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary/50 transition-all placeholder:text-white/20";
    const labelCls = "text-white/40 text-[10px] uppercase tracking-widest font-bold mb-2 block";

    return (
        <div className="min-h-screen bg-[#060907] p-8 font-montserrat">
            {/* Header */}
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-light text-white tracking-tight flex items-center gap-3">
                            <MapPin className="text-primary h-8 w-8" />
                            Zonas Restringidas
                        </h1>
                        <p className="text-white/40 text-sm mt-2">Gestioná bloqueos de envío y venta por Código Postal (Franquicias).</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Add Form */}
                    <div className="lg:col-span-1">
                        <div className="bg-[#0c120e] border border-white/5 rounded-3xl p-6 sticky top-8">
                            <h2 className="text-lg font-medium text-white mb-6 flex items-center gap-2">
                                <Plus className="text-primary h-5 w-5" />
                                Nueva Restricción
                            </h2>

                            <form onSubmit={handleAdd} className="space-y-5">
                                <div>
                                    <label className={labelCls}>Código Postal</label>
                                    <input 
                                        type="text" 
                                        className={inputCls} 
                                        placeholder="Ej: 3000" 
                                        value={newZip}
                                        onChange={e => setNewZip(e.target.value)}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className={labelCls}>Tipo de Bloqueo</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setNewType('BLOCK_SALE')}
                                            className={`py-3 rounded-xl text-[10px] font-bold uppercase transition-all flex flex-col items-center gap-2 border ${newType === 'BLOCK_SALE' ? 'bg-red-500/10 border-red-500/30 text-red-500' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'}`}
                                        >
                                            <Ban className="h-4 w-4" />
                                            Bloquear Venta
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setNewType('BLOCK_SHIPPING')}
                                            className={`py-3 rounded-xl text-[10px] font-bold uppercase transition-all flex flex-col items-center gap-2 border ${newType === 'BLOCK_SHIPPING' ? 'bg-orange-500/10 border-orange-500/30 text-orange-500' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'}`}
                                        >
                                            <Truck className="h-4 w-4" />
                                            Bloquear Envio
                                        </button>
                                    </div>
                                </div>

                                {newType === 'BLOCK_SALE' && (
                                    <div className="space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <hr className="border-white/5" />
                                        <p className="text-[10px] text-white/20 italic">En zonas de venta bloqueada (Franquicias), se mostrará la info de contacto local en el checkout.</p>
                                        
                                        <div>
                                            <label className={labelCls}>Dirección del Local</label>
                                            <textarea 
                                                className={`${inputCls} min-h-[80px]`} 
                                                placeholder="Ej: San Martín 1234, Local 5" 
                                                value={newAddress}
                                                onChange={e => setNewAddress(e.target.value)}
                                            />
                                        </div>

                                        <div>
                                            <label className={labelCls}>Teléfono / WhatsApp</label>
                                            <input 
                                                type="text" 
                                                className={inputCls} 
                                                placeholder="Ej: +54 342 1234567" 
                                                value={newPhone}
                                                onChange={e => setNewPhone(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className={labelCls}>Mensaje Personalizado (Opcional)</label>
                                    <textarea 
                                        className={`${inputCls} min-h-[60px]`} 
                                        placeholder="Mensaje que verá el cliente..." 
                                        value={newMessage}
                                        onChange={e => setNewMessage(e.target.value)}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSaving || !newZip}
                                    className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-2xl font-bold text-[11px] uppercase tracking-widest shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isSaving ? "Guardando..." : "Agregar Restricción"}
                                    <Save className="h-4 w-4" />
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* List */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="relative group">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-primary transition-colors" />
                            <input 
                                type="text"
                                placeholder="Buscar por CP o dirección..."
                                className="w-full bg-[#0c120e] border border-white/5 rounded-3xl pl-12 pr-6 py-4 text-white text-sm focus:outline-none focus:border-white/10 transition-all"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {isLoading ? (
                                Array(4).fill(0).map((_, i) => (
                                    <div key={i} className="h-48 bg-white/5 rounded-3xl animate-pulse border border-white/5"></div>
                                ))
                            ) : filtered.length === 0 ? (
                                <div className="col-span-full py-20 text-center space-y-4 bg-white/5 rounded-[40px] border border-dashed border-white/10">
                                    <MapPinOff className="h-12 w-12 text-white/10 mx-auto" />
                                    <p className="text-white/20 text-sm italic">No hay restricciones configuradas.</p>
                                </div>
                            ) : (
                                filtered.map(r => (
                                    <div key={r.id} className="bg-[#0c120e] border border-white/5 rounded-[32px] p-6 group hover:border-white/10 transition-all relative overflow-hidden">
                                        <div className={`absolute top-0 right-0 px-4 py-1.5 rounded-bl-2xl text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 ${r.type === 'BLOCK_SALE' ? 'bg-red-500/20 text-red-500' : 'bg-orange-500/20 text-orange-500'}`}>
                                            {r.type === 'BLOCK_SALE' ? <Ban className="h-3 w-3" /> : <Truck className="h-3 w-3" />}
                                            {r.type === 'BLOCK_SALE' ? 'Venta Bloqueada' : 'Envio Bloqueado'}
                                        </div>

                                        <div className="flex items-start justify-between mb-4">
                                            <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                                                <span className="text-white/40 text-[10px] uppercase font-bold block mb-0.5 tracking-tighter">CP</span>
                                                <span className="text-2xl font-mono font-bold text-white">{r.zipCode}</span>
                                            </div>
                                            <button 
                                                onClick={() => handleDelete(r.id)}
                                                className="p-2.5 rounded-xl bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/20"
                                            >
                                                <Trash2 className="h-4.5 w-4.5" />
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            {r.message && (
                                                <div className="bg-white/5 p-3 rounded-xl italic text-white/50 text-[11px]">
                                                    "{r.message}"
                                                </div>
                                            )}

                                            {r.type === 'BLOCK_SALE' && (r.address || r.phone) && (
                                                <div className="space-y-3 pt-2">
                                                    {r.address && (
                                                        <div className="flex items-start gap-3 text-white/60">
                                                            <Store className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                                            <span className="text-[11px] leading-relaxed">{r.address}</span>
                                                        </div>
                                                    )}
                                                    {r.phone && (
                                                        <div className="flex items-center gap-3 text-white/60">
                                                            <Phone className="h-4 w-4 text-primary shrink-0" />
                                                            <span className="text-[11px] font-mono">{r.phone}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Toast */}
            {toast && (
                <div className={`fixed bottom-8 right-8 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-50 animate-in slide-in-from-right-10 duration-500 ${toast.type === "success" ? "bg-primary text-white" : "bg-red-500 text-white"}`}>
                    {toast.type === "success" ? <Save className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                    <span className="text-xs font-bold uppercase tracking-widest">{toast.message}</span>
                </div>
            )}
        </div>
    );
}
