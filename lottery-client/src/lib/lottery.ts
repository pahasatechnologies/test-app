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

  async purchaseTicket(quantity: number = 1) {
    const response = await api.post('/tickets/purchase', { quantity });
    return response.data;
  },

  async getUserTickets(): Promise<{ tickets: Ticket[] }> {
    const response = await api.get('/tickets/my-tickets');
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