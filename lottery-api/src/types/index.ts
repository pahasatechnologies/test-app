export interface User {
  id: string;
  fullName: string;
  email: string;
  username: string;
  location?: string;
  password: string;
  isEmailVerified: boolean;
  role: 'admin' | 'user';
  depositCount: number;
  surpriseActivated: boolean;
  referralCode: string;
  referredBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  depositAddress: string;
  totalDeposited: number;
  totalWithdrawn: number;
  referralEarnings: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Ticket {
  id: string;
  userId: string;
  ticketNumber: string;
  purchasePrice: number;
  drawId: string;
  status: 'active' | 'expired' | 'winner';
  purchasedAt: Date;
}

export interface Draw {
  id: string;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'completed' | 'cancelled';
  firstPrizeWinner?: string;
  secondPrizeWinner?: string;
  thirdPrizeWinner?: string;
  totalTickets: number;
  prizePool: number;
  createdAt: Date;
}

export interface Deposit {
  id: string;
  userId: string;
  amount: number;
  transactionId: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
}

export interface Withdrawal {
  id: string;
  userId: string;
  amount: number;
  walletAddress: string;
  status: 'pending' | 'completed' | 'rejected';
  requestedAt: Date;
  processedAt?: Date;
}

export interface OTPVerification {
  id: string;
  userId: string;
  email: string;
  otp: string;
  expiresAt: Date;
  verified: boolean;
  createdAt: Date;
}

export interface JWTPayload {
  userId: string;
  email: string;
  username: string;
  role?: 'admin' | 'user';
}