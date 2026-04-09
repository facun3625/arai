"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, BookOpen, Loader2, Eye, EyeOff } from "lucide-react";
import { useAdminUtils } from "@/components/admin/AdminUtilsProvider";

interface KnowledgeDoc {
  id: string;
  title: string;
  content: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function KnowledgePage() {
  const { confirm, showToast } = useAdminUtils();
  const [docs, setDocs] = useState<KnowledgeDoc[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ title: "", content: "" });

  const fetchDocs = async () => {
    try {
      const res = await fetch("/api/admin/knowledge");
      const data = await res.json();
      if (Array.isArray(data)) setDocs(data);
    } catch {
      showToast("Error al cargar documentos", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchDocs(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) return;

    setIsSubmitting(true);
    try {
      const method = editingId ? "PUT" : "POST";
      const body = editingId ? { ...formData, id: editingId } : formData;
      const res = await fetch("/api/admin/knowledge", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        showToast(editingId ? "Documento actualizado" : "Documento creado");
        setFormData({ title: "", content: "" });
        setEditingId(null);
        fetchDocs();
      } else {
        const err = await res.json();
        showToast(err.error || "Error al guardar", "error");
      }
    } catch {
      showToast("Error de conexión", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (doc: KnowledgeDoc) => {
    setEditingId(doc.id);
    setFormData({ title: doc.title, content: doc.content });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ title: "", content: "" });
  };

  const handleToggleActive = async (doc: KnowledgeDoc) => {
    try {
      const res = await fetch("/api/admin/knowledge", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: doc.id, isActive: !doc.isActive }),
      });
      if (res.ok) {
        showToast(doc.isActive ? "Documento desactivado" : "Documento activado");
        fetchDocs();
      }
    } catch {
      showToast("Error al actualizar", "error");
    }
  };

  const handleDelete = async (id: string, title: string) => {
    const ok = await confirm({
      title: "¿Eliminar documento?",
      message: `¿Eliminás "${title}"? La IA dejará de usar este conocimiento.`,
      confirmText: "Eliminar",
      type: "danger",
    });
    if (!ok) return;

    try {
      const res = await fetch(`/api/admin/knowledge?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Documento eliminado");
        fetchDocs();
      } else {
        showToast("Error al eliminar", "error");
      }
    } catch {
      showToast("Error de conexión", "error");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-light text-white font-montserrat tracking-tight">base de conocimiento</h1>
        <p className="text-white/40 text-[11px] uppercase tracking-widest">documentos que usa la IA vendedora</p>
      </div>

      <div className="space-y-8">
        {/* Formulario full width */}
        <form onSubmit={handleSubmit} className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 space-y-4">
            <h2 className="text-[14px] text-white font-medium">
              {editingId ? "Editar documento" : "Agregar documento"}
            </h2>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1">Título</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[13px] text-white focus:outline-none focus:border-primary transition-colors"
                placeholder="Ej: Manual de Cultura y Ventas"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1">Contenido</label>
              <p className="text-[9px] text-white/20 ml-1 italic">Pegá el texto del documento Word acá</p>
              <textarea
                rows={20}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[13px] text-white focus:outline-none focus:border-primary transition-colors resize-y"
                placeholder="Pegá el texto completo del documento aquí..."
                required
              />
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-primary-dark text-white py-3 rounded-xl text-[12px] font-medium transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                {isSubmitting ? "Guardando..." : editingId ? "Actualizar documento" : "Guardar documento"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="w-full bg-white/5 hover:bg-white/10 text-white/60 py-3 rounded-xl text-[12px] font-medium transition-all"
                >
                  Cancelar edición
                </button>
              )}
            </div>
        </form>

        {/* Lista de documentos */}
        <div className="bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 text-white/20 animate-spin" />
              </div>
            ) : docs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <BookOpen className="h-10 w-10 text-white/10" />
                <p className="text-white/20 text-[11px] uppercase tracking-widest">No hay documentos todavía</p>
                <p className="text-white/10 text-[10px]">Agregá el primer documento para que la IA aprenda sobre Araí</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {docs.map((doc) => (
                  <div key={doc.id} className="p-5 hover:bg-white/[0.02] transition-colors group">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[13px] font-medium text-white/90 truncate">{doc.title}</span>
                          <span className={`text-[9px] px-2 py-0.5 rounded-full uppercase tracking-widest flex-shrink-0 ${
                            doc.isActive
                              ? "bg-green-500/10 text-green-400"
                              : "bg-white/5 text-white/30"
                          }`}>
                            {doc.isActive ? "activo" : "inactivo"}
                          </span>
                        </div>
                        <p className="text-[11px] text-white/30 line-clamp-2 leading-relaxed">
                          {doc.content.slice(0, 200)}...
                        </p>
                        <p className="text-[10px] text-white/20 mt-2">
                          {doc.content.length.toLocaleString()} caracteres · Actualizado {new Date(doc.updatedAt).toLocaleDateString("es-AR")}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <button
                          onClick={() => handleToggleActive(doc)}
                          className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                          title={doc.isActive ? "Desactivar" : "Activar"}
                        >
                          {doc.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => handleEdit(doc)}
                          className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id, doc.title)}
                          className="p-2 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
      </div>
    </div>
  );
}

