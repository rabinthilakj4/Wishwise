import { create } from 'zustand';
import { Wishlist, Priority } from '../types';
import { wishlistService } from '../services/wishlistService';

interface WishlistState {
  wishlists: Wishlist[];
  activeWishlist: Wishlist | null;
  comparedProductIds: string[];
  isLoading: boolean;
  fetchWishlists: () => Promise<void>;
  createWishlist: (name: string, description?: string) => Promise<void>;
  addItemToWishlist: (productId: string, priority?: Priority, targetPrice?: number, variantId?: string, selectedVariant?: Record<string, string>) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  toggleCompareProduct: (productId: string) => void;
  clearCompare: () => void;
  isProductWishlisted: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  wishlists: [],
  activeWishlist: null,
  comparedProductIds: [],
  isLoading: false,

  fetchWishlists: async () => {
    set({ isLoading: true });
    try {
      const res: any = await wishlistService.getWishlists();
      const lists: Wishlist[] = res.data || [];
      set({
        wishlists: lists,
        activeWishlist: lists[0] || null,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  createWishlist: async (name, description) => {
    await wishlistService.createWishlist({ name, description });
    await get().fetchWishlists();
  },

  addItemToWishlist: async (productId, priority = 'MEDIUM', targetPrice, variantId, selectedVariant) => {
    const active = get().activeWishlist;
    await wishlistService.addItem({
      wishlistId: active?.id,
      productId,
      variantId,
      selectedVariant,
      priority,
      targetPrice,
    });
    await get().fetchWishlists();
  },

  removeItem: async (itemId) => {
    await wishlistService.removeItem(itemId);
    await get().fetchWishlists();
  },

  toggleCompareProduct: (productId) => {
    const current = get().comparedProductIds;
    if (current.includes(productId)) {
      set({ comparedProductIds: current.filter(id => id !== productId) });
    } else {
      if (current.length >= 4) {
        alert('You can compare up to 4 products at a time.');
        return;
      }
      set({ comparedProductIds: [...current, productId] });
    }
  },

  clearCompare: () => set({ comparedProductIds: [] }),

  isProductWishlisted: (productId) => {
    const { wishlists } = get();
    return wishlists.some(w => w.items.some(i => i.productId === productId));
  },
}));
