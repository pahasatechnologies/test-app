export interface User {
  id: string;
  fullName: string;
  email: string;
  username: string;
  role: 'admin' | 'user';
  referralCode: string;
  isEmailVerified: boolean;
}

export interface Wallet {
  id: string;
  balance: number;
  depositAddress: string;
  totalDeposited: number;
  totalWithdrawn: number;
  referralEarnings: number;
  maxWithdrawalAmount: number;
  depositCount: number;
  surpriseActivated: boolean;
}

export interface Ticket {
  id: string;
  ticketNumber: string;
  purchasePrice: number;
  status: 'active' | 'expired' | 'winner';
  purchasedAt: string;
  draw: {
    id: string;
    startDate: string;
    endDate: string;
    status: 'active' | 'completed' | 'cancelled';
    daysRemaining: number;
  };
  isWinner: boolean;
  prizeWon?: number;
}

export interface Draw {
  id: string;
  startDate: string;
  endDate: string;
  totalTickets: number;
  prizePool: number;
  daysRemaining: number;
}

export interface TicketInfo {
  ticketPrice: number;
  prizes: {
    first: number;
    second: number;
    third: number;
  };
  currentDraw: Draw | null;
}

export interface DrawHistory {
  id: string;
  startDate: string;
  endDate: string;
  status: string;
  totalTickets: number;
  prizePool: number;
  createdAt: string;
  winners: {
    first?: { name: string; ticketNumber: string; prize: number };
    second?: { name: string; ticketNumber: string; prize: number };
    third?: { name: string; ticketNumber: string; prize: number };
  };
}

export interface AuthResponse {
  message: string;
  token?: string;
  user?: User;
  userId?: string;
  email?: string;
}

export interface ApiResponse<T = any> {
  message?: string;
  error?: string;
  data?: T;
}

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  username: string;
  location?: string;
  isEmailVerified: boolean;
  depositCount: number;
  surpriseActivated: boolean;
  referralCode: string;
  createdAt: string;
  wallet: {
    balance: number;
    totalDeposited: number;
    totalWithdrawn: number;
    referralEarnings: number;
  };
  totalTickets: number;
}

export interface AdminStats {
  totalUsers: number;
  verifiedUsers: number;
  activeDraws: number;
  completedDraws: number;
  activeTickets: number;
  totalDeposits: number;
  totalWithdrawals: number;
  totalWalletBalance: number;
}

export interface PendingWithdrawal {
  id: string;
  amount: number;
  walletAddress: string;
  status: string;
  requestedAt: string;
  user: {
    fullName: string;
    email: string;
    username: string;
  };
}