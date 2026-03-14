"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  variant?: string;
  addons?: Record<string, string[]>;
}

interface CartState {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
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
          set({ items: [...items, product] });
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
