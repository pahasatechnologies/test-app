import api from './api';
import { Wallet, Ticket, TicketInfo, DrawHistory } from '@/types';

export const lotteryService = {
  // Wallet operations
  async getWallet(): Promise<{ wallet: Wallet }> {
    const response = await api.get('/wallet');
    return response.data;
  },

  async processDeposit(amount: number, transactionId: string) {
    const response = await api.post('/wallet/deposit', { amount, transactionId });
    return response.data;
  },

  async requestWithdrawal(fullName: string, walletAddress: string, amount: number) {
    const response = await api.post('/wallet/withdraw', { fullName, walletAddress, amount });
    return response.data;
  },

  async getWithdrawals() {
    const response = await api.get('/wallet/withdrawals');
    return response.data;
  },

  // Ticket operations
  async getTicketInfo(): Promise<TicketInfo> {
    const response = await api.get('/tickets/info');
    return response.data;
  },

  async purchaseTicket(ticketTypeId: string, quantity: number = 1) {
    const response = await api.post('/tickets/purchase', { ticketTypeId, quantity });
    return response.data;
  },

  async getUserTickets(): Promise<{ tickets: Ticket[] }> {
    const response = await api.get('/tickets/my-tickets');
    return response.data;
  },

  // Ticket Type operations
  async getTicketTypes(activeOnly: boolean = true): Promise<{ ticketTypes: TicketType[] }> {
    const response = await api.get(`/ticket-types?active=${activeOnly}`);
    return response.data;
  },

  async createTicketType(data: {
    name: string;
    description?: string;
    price: number;
    color?: string;
  }) {
    const response = await api.post('/ticket-types', data);
    return response.data;
  },

  async updateTicketType(id: string, data: {
    name?: string;
    description?: string;
    price?: number;
    color?: string;
    isActive?: boolean;
  }) {
    const response = await api.put(`/ticket-types/${id}`, data);
    return response.data;
  },

  async deleteTicketType(id: string) {
    const response = await api.delete(`/ticket-types/${id}`);
    return response.data;
  },

  async getTicketTypeStats() {
    const response = await api.get('/ticket-types/admin/stats');
    return response.data;
  },

  // Notification operations
  async getNotifications(limit: number = 20): Promise<{ notifications: Notification[] }> {
    const response = await api.get(`/notifications?limit=${limit}`);
    return response.data;
  },

  async getUnreadCount(): Promise<{ unreadCount: number }> {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },

  async markAsRead(notificationId: string) {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data;
  },

  async markAllAsRead() {
    const response = await api.put('/notifications/mark-all-read');
    return response.data;
  },

  async deleteNotification(notificationId: string) {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
  },

  async sendGlobalNotification(data: {
    title: string;
    message: string;
    type?: 'info' | 'success' | 'warning' | 'error';
  }) {
    const response = await api.post('/notifications/admin/global', data);
    return response.data;
  },

  // Draw operations
  async getDrawHistory(page: number = 1, limit: number = 10): Promise<{
    draws: DrawHistory[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const response = await api.get(`/draws/history?page=${page}&limit=${limit}`);
    return response.data;
  }
};