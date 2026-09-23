import { create } from 'zustand';
import { Cart } from '../types';
import { cartService } from '../services/cartService';

interface PendingCartItem {
  productId: string;
  quantity?: number;
  variantId?: string;
  selectedVariant?: Record<string, string>;
}

interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  showLoginModal: boolean;
  pendingCartAction: PendingCartItem | null;
  setShowLoginModal: (show: boolean) => void;
  setPendingCartAction: (action: PendingCartItem | null) => void;
  fetchCart: () => Promise<void>;
  addToCart: (productId: string, quantity?: number, variantId?: string, selectedVariant?: Record<string, string>) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  executePendingCartAction: () => Promise<void>;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  isLoading: false,
  showLoginModal: false,
  pendingCartAction: null,

  setShowLoginModal: (show: boolean) => set({ showLoginModal: show }),
  setPendingCartAction: (action: PendingCartItem | null) => set({ pendingCartAction: action }),

  fetchCart: async () => {
    try {
      const res: any = await cartService.getCart();
      set({ cart: res.data });
    } catch {
      set({ cart: null });
    }
  },

  addToCart: async (productId, quantity = 1, variantId, selectedVariant) => {
    set({ isLoading: true });
    try {
      await cartService.addToCart(productId, quantity, variantId, selectedVariant);
      await get().fetchCart();
    } finally {
      set({ isLoading: false });
    }
  },

  executePendingCartAction: async () => {
    const { pendingCartAction, addToCart } = get();
    if (pendingCartAction) {
      await addToCart(
        pendingCartAction.productId,
        pendingCartAction.quantity,
        pendingCartAction.variantId,
        pendingCartAction.selectedVariant
      );
      set({ pendingCartAction: null, showLoginModal: false });
    }
  },

  updateQuantity: async (itemId, quantity) => {
    await cartService.updateQuantity(itemId, quantity);
    await get().fetchCart();
  },

  removeFromCart: async (itemId) => {
    await cartService.removeFromCart(itemId);
    await get().fetchCart();
  },
}));
