import api from './api';
import { AdminUser, AdminStats, PendingWithdrawal, DrawHistory } from '@/types';

export const adminService = {
  // Dashboard Stats
  async getDashboardStats(): Promise<{ stats: AdminStats }> {
    const response = await api.get('/admin/dashboard/stats');
    return response.data;
  },

  // User Management
  async getAllUsers(page: number = 1, limit: number = 20, search: string = ''): Promise<{
    users: AdminUser[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const response = await api.get(`/admin/users?page=${page}&limit=${limit}&search=${search}`);
    return response.data;
  },

  // Draw Management
  async getAllDraws(): Promise<{ draws: DrawHistory[] }> {
    const response = await api.get(`/admin/draws`);
    return response.data;
  },

  async conductDraw() {
    const response = await api.post('/admin/draws/conduct');
    return response.data;
  },

  // Withdrawal Management
  async getPendingWithdrawals(): Promise<{ withdrawals: PendingWithdrawal[] }> {
    const response = await api.get('/admin/withdrawals/pending');
    return response.data;
  },

  async processWithdrawal(withdrawalId: string, action: 'approve' | 'reject', reason?: string) {
    const response = await api.post('/admin/withdrawals/process', {
      withdrawalId,
      action,
      reason
    });
    return response.data;
  },

  // System Configuration
  async getSystemConfig() {
    const response = await api.get('/admin/config');
    return response.data;
  },

  async getSystemConfigs(category?: string): Promise<{ configs: any[] }> {
    const url = category ? `/admin/config/all?category=${encodeURIComponent(category)}` : '/admin/config/all';
    const response = await api.get(url);
    return response.data;
  },

  async getConfigByKey(key: string): Promise<{ key: string; value: string }> {
    const response = await api.get(`/admin/config/key/${encodeURIComponent(key)}`);
    return response.data;
  },

  async updateSystemConfig(key: string, value: string) {
    const response = await api.put(`/admin/config/key/${encodeURIComponent(key)}`, { value });
    return response.data;
  },

  async initializeDefaultConfigs() {
    const response = await api.post('/admin/config/initialize');
    return response.data;
  },

  // Admin User Management
  async createAdminUser(data: {
    fullName: string;
    email: string;
    username: string;
    password: string;
  }) {
    const response = await api.post('/admin/users/create-admin', data);
    return response.data;
  }
};