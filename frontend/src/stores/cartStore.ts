import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, MenuItem, MenuVariant, MenuAddon } from '../types/shared';
import { calculateItemTotal } from '@/utils/tempUtils';

interface CartState {
  items: CartItem[];
  isOpen: boolean;

  // Actions
  addItem: (
    menuItem: MenuItem,
    variant?: MenuVariant,
    addons?: MenuAddon[],
    quantity?: number,
    notes?: string
  ) => void;
  removeItem: (index: number) => void;
  updateItemQuantity: (index: number, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  setCartOpen: (open: boolean) => void;

  // Computed
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getItemPrice: (item: CartItem) => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (menuItem, variant, addons = [], quantity = 1, notes) => {
        const variantModifier = variant?.price_modifier || 0;
        const addonPrices = addons.reduce((sum, addon) => sum + addon.price, 0);
        const itemPrice = menuItem.base_price + variantModifier + addonPrices;

        const newItem: CartItem = {
          id: `${menuItem.id}-${Date.now()}`,
          menu_item_id: menuItem.id,
          menu_item: menuItem,
          name: menuItem.name,
          price: itemPrice,
          variant,
          addons,
          quantity,
          notes,
          total: itemPrice * quantity,
        };

        set((state) => ({
          items: [...state.items, newItem],
        }));
      },

      removeItem: (index) => {
        set((state) => ({
          items: state.items.filter((_, i) => i !== index),
        }));
      },

      updateItemQuantity: (index, quantity) => {
        if (quantity <= 0) {
          get().removeItem(index);
          return;
        }

        set((state) => ({
          items: state.items.map((item, i) =>
            i === index ? { ...item, quantity } : item
          ),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      toggleCart: () => {
        set((state) => ({ isOpen: !state.isOpen }));
      },

      setCartOpen: (open) => {
        set({ isOpen: open });
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => {
          return total + get().getItemPrice(item);
        }, 0);
      },

      getItemPrice: (item) => {
        if (!item.menu_item) {
          return item.price * item.quantity;
        }

        const variantModifier = item.variant?.price_modifier || 0;
        const addonPrices = item.addons.map(addon => addon.price);

        return calculateItemTotal(
          item.menu_item.base_price,
          variantModifier,
          addonPrices,
          item.quantity
        );
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        items: state.items
      }),
    }
  )
);
