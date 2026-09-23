import { api } from './api';
import { User, DemandReportItem } from '../types';

export interface AdminDashboardData {
  kpi: {
    totalUsers: number;
    totalProducts: number;
    totalWishlists: number;
    totalWishlistItems: number;
    totalOrders: number;
    totalRevenue: number;
    conversionRate: string;
  };
  mostWishlisted: any[];
  lowStockProducts: any[];
}

export const adminService = {
  getDashboardStats: async () => {
    return api.get<AdminDashboardData>('/admin/dashboard');
  },
  getUsers: async () => {
    return api.get<User[]>('/admin/users');
  },
  updateUserRole: async (userId: string, role?: string, status?: string) => {
    return api.put<User>(`/admin/users/${userId}/role`, { role, status });
  },
  getDemandReport: async () => {
    return api.get<DemandReportItem[]>('/admin/demand');
  },
  getAuditLogs: async () => {
    return api.get<any[]>('/admin/audit-logs');
  },
};
