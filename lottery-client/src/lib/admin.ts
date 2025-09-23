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
  async getAllDraws(page: number = 1, limit: number = 10): Promise<{
    draws: DrawHistory[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const response = await api.get(`/admin/draws?page=${page}&limit=${limit}`);
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