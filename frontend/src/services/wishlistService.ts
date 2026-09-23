import { api } from './api';
import { Wishlist, WishlistItem, Priority, BudgetPlan, AiResponse } from '../types';

export const wishlistService = {
  getWishlists: async () => {
    return api.get<Wishlist[]>('/wishlists');
  },
  getWishlistById: async (id: string) => {
    return api.get<Wishlist>(`/wishlists/${id}`);
  },
  createWishlist: async (data: { name: string; description?: string; visibility?: string }) => {
    return api.post<Wishlist>('/wishlists', data);
  },
  updateWishlist: async (id: string, data: { name?: string; description?: string; visibility?: string }) => {
    return api.put<Wishlist>(`/wishlists/${id}`, data);
  },
  deleteWishlist: async (id: string) => {
    return api.delete(`/wishlists/${id}`);
  },
  addItem: async (data: { wishlistId?: string; productId: string; variantId?: string; selectedVariant?: Record<string, string>; priority?: Priority; notes?: string; targetPrice?: number }) => {
    return api.post<WishlistItem>('/wishlists/items', data);
  },
  updateItem: async (itemId: string, data: { priority?: Priority; notes?: string; targetPrice?: number; archivedAt?: string | null }) => {
    return api.put<WishlistItem>(`/wishlists/items/${itemId}`, data);
  },
  removeItem: async (itemId: string) => {
    return api.delete(`/wishlists/items/${itemId}`);
  },
  togglePlanningToBuy: async (itemId: string) => {
    return api.post<WishlistItem>(`/wishlists/items/${itemId}/toggle-planning-buy`);
  },
  moveToCart: async (itemId: string, removeFromWishlist = false) => {
    return api.post(`/wishlists/items/${itemId}/move-to-cart`, { removeFromWishlist });
  },
  addMember: async (wishlistId: string, email: string, permission?: string) => {
    return api.post(`/wishlists/${wishlistId}/members`, { email, permission });
  },
  getBudgetPlan: async (budgetAmount: number, wishlistId?: string) => {
    return api.get<BudgetPlan>('/budget', { params: { budgetAmount, wishlistId } });
  },
  askAiAssistant: async (prompt: string, budget?: number) => {
    return api.post<AiResponse>('/assistant/chat', { prompt, budget });
  },
};
