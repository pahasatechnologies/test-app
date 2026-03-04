export interface User {
  id: string;
  fullName: string;
  email: string;
  username: string;
  mobileNumber?: string;
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
  ticketType?: TicketType;
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

export interface TicketType {
  id: string;
  name: string;
  description?: string;
  price: number;
  color: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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
  ticketTypes: TicketType[];
  prizes: {
    first: number;
    second: number;
    third: number;
  };
  currentDraw: Draw | null;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  isGlobal: boolean;
  createdAt: string;
  user?: {
    fullName: string;
    email: string;
  };
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

export interface LotteryPool {
  id: string;
  poolType: string;
  entryFee: number;
  maxParticipants: number;
  currentParticipants: number;
  status: string;
  firstPrize: number;
  secondPrize: number;
  thirdPrize: number;
  participationFee: number;
  networkFee: number;
  refundAmount: number;
  createdAt: string;
}

export interface PoolParticipation {
  id: string;
  entryAmount: number;
  participationFee: number;
  networkFee: number;
  isWinner: boolean;
  prizeWon: number;
  refundProcessed: boolean;
  joinedAt: string;
  pool: {
    poolType: string;
    entryFee: number;
    status: string;
    completedAt?: string;
  };
}

export interface TclTokens {
  balance: number;
  totalEarned: number;
  isWithdrawable: boolean;
}

export interface RefundTransaction {
  id: string;
  refundAmount: number;
  status: string;
  processedAt?: string;
  createdAt: string;
  pool: {
    poolType: string;
    entryFee: number;
  };
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