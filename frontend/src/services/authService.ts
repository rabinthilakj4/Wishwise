import { api } from './api';
import { User } from '../types';

export const authService = {
  login: async (credentials: { email: string; password: string }) => {
    return api.post<{ user: User; tokens: { accessToken: string; refreshToken: string } }>('/auth/login', credentials);
  },
  register: async (data: { name: string; email: string; password: string; role?: string }) => {
    return api.post<{ user: User; tokens: { accessToken: string; refreshToken: string } }>('/auth/register', data);
  },
  getMe: async () => {
    return api.get<User>('/auth/me');
  },
  uploadProfilePhoto: async (imageBase64: string) => {
    return api.post<User>('/auth/profile-photo', { imageBase64 });
  },
  removeProfilePhoto: async () => {
    return api.delete<User>('/auth/profile-photo');
  },
};
