"use client";

import { useState, useEffect, useRef } from "react";
import { Save, Loader2, CheckCircle2, XCircle, ImageIcon, Upload } from "lucide-react";

const HERO_SLOTS = [
  { key: "heroImage1", label: "Panel 1 — Arma tu Blend", defaultSrc: "/images/proceso/1.webp" },
  { key: "heroImage2", label: "Panel 2 — Yerba Mate", defaultSrc: "/images/proceso/2.jpg" },
  { key: "heroImage3", label: "Panel 3 — Hierbas", defaultSrc: "/images/proceso/3.jpg" },
  { key: "heroImage4", label: "Panel 4 — Accesorios", defaultSrc: "/images/proceso/5.jpeg" },
] as const;

type SlotKey = "heroImage1" | "heroImage2" | "heroImage3" | "heroImage4";

export default function HeroAjustesPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [uploading, setUploading] = useState<SlotKey | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [settings, setSettings] = useState<Record<SlotKey, string>>({
    heroImage1: "",
    heroImage2: "",
    heroImage3: "",
    heroImage4: "",
  });
  const fileRefs = useRef<Record<SlotKey, HTMLInputElement | null>>({
    heroImage1: null,
    heroImage2: null,
    heroImage3: null,
    heroImage4: null,
  });

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data && !data.error) {
          setSettings({
            heroImage1: data.heroImage1 || "",
            heroImage2: data.heroImage2 || "",
            heroImage3: data.heroImage3 || "",
            heroImage4: data.heroImage4 || "",
          });
        }
      });
  }, []);

  const handleUpload = async (key: SlotKey, file: File) => {
    setUploading(key);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error();
      const { url } = await res.json();
      setSettings((prev) => ({ ...prev, [key]: url }));
    } catch {
      showToast("Error al subir la imagen", "error");
    } finally {
      setUploading(null);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error();
      showToast("Imágenes guardadas correctamente");
    } catch {
      showToast("Error al guardar", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl">
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-medium ${toast.type === "success" ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
          {toast.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
          {toast.message}
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Imágenes del Hero</h1>
        <p className="text-sm text-gray-500 mt-1">Subí una imagen o pegá una URL. Si lo dejás vacío se usa la imagen por defecto.</p>
      </div>

      <div className="space-y-6">
        {HERO_SLOTS.map((slot) => {
          const key = slot.key as SlotKey;
          const value = settings[key];
          const preview = value || slot.defaultSrc;
          const isUploading = uploading === key;

          return (
            <div key={key} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex gap-6 items-start">
              {/* Preview */}
              <div className="w-28 h-28 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-200">
                {preview ? (
                  <img src={preview} alt={slot.label} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-gray-300" />
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-3">
                <label className="block text-sm font-semibold text-gray-700">{slot.label}</label>
                <p className="text-xs text-gray-400">Por defecto: <code className="bg-gray-100 px-1 rounded">{slot.defaultSrc}</code></p>

                {/* URL input */}
                <input
                  type="text"
                  placeholder="https://... o /images/..."
                  value={value}
                  onChange={(e) => setSettings((prev) => ({ ...prev, [key]: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />

                {/* Upload button */}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={(el) => { fileRefs.current[key] = el; }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUpload(key, file);
                    e.target.value = "";
                  }}
                />
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => fileRefs.current[key]?.click()}
                  className="flex items-center gap-2 text-sm text-gray-500 border border-gray-200 rounded-xl px-4 py-2 hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
                >
                  {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  {isUploading ? "Subiendo..." : "Subir imagen"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Guardar cambios
        </button>
      </div>
    </div>
  );
}
