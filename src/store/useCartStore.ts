"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  weight?: number;
  variant?: string;
  addons?: Record<string, string[]>;
}

interface CartState {
  items: Product[];
  isOpen: boolean;
  addItem: (product: Product) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      openDrawer: () => set({ isOpen: true }),
      closeDrawer: () => set({ isOpen: false }),
      addItem: (product) => {
        const items = get().items;

        // Define uniqueness based on ID, Variant, AND Add-ons
        const existingItem = items.find((item) => {
          const sameId = item.id === product.id;
          const sameVariant = item.variant === product.variant;
          const sameAddons = JSON.stringify(item.addons || {}) === JSON.stringify(product.addons || {});
          return sameId && sameVariant && sameAddons;
        });

        if (existingItem) {
          set({
            isOpen: true,
            items: items.map((item) => {
              const sameId = item.id === product.id;
              const sameVariant = item.variant === product.variant;
              const sameAddons = JSON.stringify(item.addons || {}) === JSON.stringify(product.addons || {});

              if (sameId && sameVariant && sameAddons) {
                return { ...item, quantity: item.quantity + product.quantity };
              }
              return item;
            }),
          });
        } else {
          set({ items: [...items, product], isOpen: true });
        }
      },
      removeItem: (id) =>
        set({
          items: get().items.filter((item) => item.id !== id),
        }),
      updateQuantity: (id, quantity) =>
        set({
          items: get().items.map((item) =>
            item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
          ),
        }),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: "cart-storage",
    }
  )
);

// Synchronization Logic
if (typeof window !== "undefined") {
  let sessionId = localStorage.getItem("arai_cart_session");
  if (!sessionId) {
    sessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    localStorage.setItem("arai_cart_session", sessionId);
  }

  useCartStore.subscribe((state) => {
    const authData = JSON.parse(localStorage.getItem("auth-storage") || "{}");
    const user = authData?.state?.user;

    const subtotal = state.items.reduce((total, item) => {
      const price = Number(item.price);
      return total + (isNaN(price) ? 0 : price) * item.quantity;
    }, 0);

    fetch("/api/user/cart/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        userId: user?.id,
        email: user?.email,
        name: user?.name,
        items: state.items,
        total: subtotal,
      }),
    }).catch(err => console.error("Sync failed:", err));
  });
}
