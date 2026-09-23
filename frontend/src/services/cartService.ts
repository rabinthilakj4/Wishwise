import { api } from './api';
import { Cart, CartItem, Order, Notification } from '../types';

export const cartService = {
  getCart: async () => {
    return api.get<Cart>('/cart');
  },
  addToCart: async (productId: string, quantity = 1, variantId?: string, selectedVariant?: Record<string, string>) => {
    return api.post<CartItem>('/cart/items', { productId, quantity, variantId, selectedVariant });
  },
  updateQuantity: async (itemId: string, quantity: number) => {
    return api.put<CartItem>(`/cart/items/${itemId}`, { quantity });
  },
  removeFromCart: async (itemId: string) => {
    return api.delete(`/cart/items/${itemId}`);
  },
  checkout: async (shippingAddress: string, paymentMethod = 'CARD') => {
    return api.post<Order>('/orders', { shippingAddress, paymentMethod });
  },
  getOrders: async () => {
    return api.get<Order[]>('/orders');
  },
  getNotifications: async () => {
    return api.get<{ notifications: Notification[]; unreadCount: number }>('/notifications');
  },
  markNotificationRead: async (id: string) => {
    return api.put(`/notifications/${id}/read`);
  },
  markAllNotificationsRead: async () => {
    return api.put('/notifications/read-all');
  },
};
