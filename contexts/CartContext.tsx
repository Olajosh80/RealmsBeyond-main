'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useCartStore, CartItem } from '@/lib/stores/cartStore';

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export type { CartItem } from '@/lib/stores/cartStore';

export function CartProvider({ children }: { children: ReactNode }) {
  const store = useCartStore();

  return (
    <CartContext.Provider
      value={{
        items: store.items,
        addItem: store.addItem,
        removeItem: store.removeItem,
        updateQuantity: store.updateQuantity,
        clearCart: store.clearCart,
        getTotalPrice: store.getTotalPrice,
        getTotalItems: store.getTotalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
