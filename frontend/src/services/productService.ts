import { api } from './api';
import { Product, Category } from '../types';

export interface ProductQueryParams {
  search?: string;
  category?: string;
  subcategory?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  availability?: string;
  minRating?: number;
  sort?: string;
  page?: number;
  limit?: number;
}

export const productService = {
  getProducts: async (params?: ProductQueryParams) => {
    return api.get<Product[]>('/products', { params });
  },
  getNewlyLaunchedProducts: async () => {
    return api.get<Product[]>('/products/newly-launched');
  },
  getProductById: async (id: string) => {
    return api.get<Product>(`/products/${id}`);
  },
  getCategories: async () => {
    return api.get<Category[]>('/categories');
  },
  compareProducts: async (productIds: string[]) => {
    return api.post<Product[]>('/products/compare', { productIds });
  },
  getSimilarProducts: async (productId: string) => {
    return api.get<Array<{ product: Product; similarityScore: number; recommendationReason: string }>>(`/products/${productId}/similar`);
  },
  createProduct: async (data: any) => {
    return api.post<Product>('/products', data);
  },
  updateProduct: async (id: string, data: any) => {
    return api.put<Product>(`/products/${id}`, data);
  },
  deleteProduct: async (id: string) => {
    return api.delete(`/products/${id}`);
  },
};
