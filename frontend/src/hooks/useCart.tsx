import { useState, createContext, useContext, ReactNode } from 'react';
import { CartItem } from '../types';

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, delta: number) => void;
  clearCart: () => void;
  totalItems: number;
}

const CartContext = createContext<CartContextType>(null!);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (newItem: CartItem) => {
    setItems(prev => {
      const existing = prev.find(i => i.itemId === newItem.itemId);
      if (existing) {
        return prev.map(i =>
          i.itemId === newItem.itemId
            ? { ...i, quantity: Math.min(i.quantity + newItem.quantity, i.stock) }
            : i
        );
      }
      return [...prev, newItem];
    });
  };

  const removeItem = (itemId: string) => {
    setItems(prev => prev.filter(i => i.itemId !== itemId));
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setItems(prev =>
      prev.map(i => {
        if (i.itemId !== itemId) return i;
        const newQty = i.quantity + delta;
        if (newQty <= 0) return null;
        return { ...i, quantity: Math.min(newQty, i.stock) };
      }).filter(Boolean) as CartItem[]
    );
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
