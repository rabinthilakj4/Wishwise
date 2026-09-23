import { create } from 'zustand';
import { User } from '../types';
import { authService } from '../services/authService';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isInitialAuthChecking: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (data: { name: string; email: string; password: string; role?: string }) => Promise<void>;
  logout: () => void;
  fetchProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('wishwise_access_token'),
  isLoading: false,
  isInitialAuthChecking: !!localStorage.getItem('wishwise_access_token'),

  login: async (credentials) => {
    set({ isLoading: true });
    try {
      const res: any = await authService.login(credentials);
      const { user, tokens } = res.data;
      localStorage.setItem('wishwise_access_token', tokens.accessToken);
      set({ user, token: tokens.accessToken, isLoading: false, isInitialAuthChecking: false });
    } catch (err) {
      set({ isLoading: false, isInitialAuthChecking: false });
      throw err;
    }
  },

  register: async (data) => {
    set({ isLoading: true });
    try {
      const res: any = await authService.register(data);
      const { user, tokens } = res.data;
      localStorage.setItem('wishwise_access_token', tokens.accessToken);
      set({ user, token: tokens.accessToken, isLoading: false, isInitialAuthChecking: false });
    } catch (err) {
      set({ isLoading: false, isInitialAuthChecking: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('wishwise_access_token');
    set({ user: null, token: null, isInitialAuthChecking: false });
  },

  fetchProfile: async () => {
    const token = localStorage.getItem('wishwise_access_token');
    if (!token) {
      set({ user: null, token: null, isInitialAuthChecking: false });
      return;
    }
    try {
      const res: any = await authService.getMe();
      set({ user: res.data, isInitialAuthChecking: false });
    } catch {
      localStorage.removeItem('wishwise_access_token');
      set({ user: null, token: null, isInitialAuthChecking: false });
    }
  },
}));
