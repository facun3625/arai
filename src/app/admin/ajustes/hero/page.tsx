"use client";

import { useState, useEffect } from "react";
import { Save, Loader2, CheckCircle2, XCircle, ImageIcon } from "lucide-react";

const HERO_SLOTS = [
  { key: "heroImage1", label: "Panel 1 — Arma tu Blend", defaultSrc: "/images/proceso/1.webp" },
  { key: "heroImage2", label: "Panel 2 — Yerba Mate", defaultSrc: "/images/proceso/2.jpg" },
  { key: "heroImage3", label: "Panel 3 — Hierbas", defaultSrc: "/images/proceso/3.jpg" },
  { key: "heroImage4", label: "Panel 4 — Accesorios", defaultSrc: "/images/proceso/5.jpeg" },
] as const;

export default function HeroAjustesPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [settings, setSettings] = useState({
    heroImage1: "",
    heroImage2: "",
    heroImage3: "",
    heroImage4: "",
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
        <p className="text-sm text-gray-500 mt-1">Pegá la URL de cada imagen. Si lo dejás vacío se usa la imagen por defecto.</p>
      </div>

      <div className="space-y-6">
        {HERO_SLOTS.map((slot) => {
          const value = settings[slot.key];
          const preview = value || slot.defaultSrc;
          return (
            <div key={slot.key} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex gap-6 items-start">
              <div className="w-28 h-28 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-200">
                {preview ? (
                  <img src={preview} alt={slot.label} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-gray-300" />
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <label className="block text-sm font-semibold text-gray-700">{slot.label}</label>
                <p className="text-xs text-gray-400">Por defecto: <code className="bg-gray-100 px-1 rounded">{slot.defaultSrc}</code></p>
                <input
                  type="text"
                  placeholder="https://... o /images/..."
                  value={value}
                  onChange={(e) => setSettings((prev) => ({ ...prev, [slot.key]: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
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
