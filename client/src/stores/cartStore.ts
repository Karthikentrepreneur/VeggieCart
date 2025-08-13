import { create } from 'zustand';
import type { CartItem, CartStore } from '@/lib/types';

export const useCartStore = create<CartStore>((set, get) => ({
  isOpen: false,
  items: [],
  
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  
  setItems: (items) => set({ items }),
  
  getTotalItems: () => {
    const { items } = get();
    return items.reduce((total, item) => total + item.quantity, 0);
  },
  
  getTotalPrice: () => {
    const { items } = get();
    return items.reduce((total, item) => total + (parseFloat(item.product.price) * item.quantity), 0);
  },
}));
