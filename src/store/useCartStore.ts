import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  quantity: number;
  stock: number;
  netPrice: number;
  discount: number;
}

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  totalNetPrice: number;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

const calculateTotals = (items: CartItem[]) => {
  return {
    totalItems: items.reduce((total, item) => total + item.quantity, 0),
    totalPrice: items.reduce((total, item) => total + item.price * item.quantity, 0),
    totalNetPrice: items.reduce((total, item) => total + item.netPrice * item.quantity, 0),
  }
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      totalPrice: 0,
      totalNetPrice: 0,

      addItem: (newItem: CartItem) => {
        const currentItems = get().items;
        const existingItem = currentItems.find((item: CartItem) => item.id === newItem.id);

        let newItems;
        if (existingItem) {
          const newQuantity = existingItem.quantity + newItem.quantity;
          const clampedQuantity = Math.min(newQuantity, newItem.stock);
          newItems = currentItems.map((item: CartItem) =>
            item.id === newItem.id
              ? { ...item, quantity: clampedQuantity }
              : item
          );
        } else {
          newItems = [...currentItems, newItem];
        }

        set({ items: newItems, ...calculateTotals(newItems) });
      },

      removeItem: (id: string) => {
        const newItems = get().items.filter((item: CartItem) => item.id !== id);
        set({ items: newItems, ...calculateTotals(newItems) });
      },

      updateQuantity: (id: string, quantity: number) => {
        const items = get().items;
        const item = items.find((i: CartItem) => i.id === id);
        if (!item) return;

        const newQuantity = Math.max(1, Math.min(quantity, item.stock));
        const newItems = items.map((i: CartItem) =>
          i.id === id ? { ...i, quantity: newQuantity } : i
        );
        
        set({ items: newItems, ...calculateTotals(newItems) });
      },

      clearCart: () => set({ 
        items: [], 
        totalItems: 0, 
        totalPrice: 0, 
        totalNetPrice: 0 
      }),
    }),
    {
      name: "krausz-cart-storage",
    }
  )
);
