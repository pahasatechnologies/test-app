import { Prisma } from '@prisma/client';

// Use Prisma's GetPayload utility to generate types from your schema
export type User = Prisma.UserGetPayload<{}>;
export type Wallet = Prisma.WalletGetPayload<{}>;
export type Ticket = Prisma.TicketGetPayload<{}>;
export type Draw = Prisma.DrawGetPayload<{}>;
export type Deposit = Prisma.DepositGetPayload<{}>;
export type Withdrawal = Prisma.WithdrawalGetPayload<{}>;
export type OtpVerification = Prisma.OtpVerificationGetPayload<{}>;

// Complex query types with relations
export type UserWithWallet = Prisma.UserGetPayload<{
  include: { wallet: true }
}>;

export type UserWithAll = Prisma.UserGetPayload<{
  include: { 
    wallet: true;
    tickets: true;
    deposits: true;
    withdrawals: true;
    otpVerifications: true;
  }
}>;

export type WalletWithUser = Prisma.WalletGetPayload<{
  include: { 
    user: {
      select: {
        depositCount: true;
        surpriseActivated: true;
        fullName: true;
        email: true;
      }
    }
  }
}>;

export type TicketWithDrawAndUser = Prisma.TicketGetPayload<{
  include: {
    draw: true;
    user: {
      select: {
        fullName: true;
        email: true;
        location: true;
      }
    }
  }
}>;

export type DrawWithTickets = Prisma.DrawGetPayload<{
  include: {
    tickets: {
      include: {
        user: {
          select: {
            fullName: true;
            email: true;
            location: true;
          }
        }
      }
    }
  }
}>;

// Request/Response interfaces for Express
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    username: string;
    role?: 'admin' | 'user';
  };
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Service-specific types
export interface WalletBalance {
  balance: number;
  maxWithdrawalAmount: number;
  totalDeposited: number;
  totalWithdrawn: number;
  referralEarnings: number;
  depositCount: number;
  surpriseActivated: boolean;
}

export interface TicketPurchaseRequest {
  quantity: number;
}

export interface TicketPurchaseResponse {
  tickets: Ticket[];
  totalCost: number;
  drawId: string;
  message: string;
}

export interface DepositRequest {
  amount: number;
  transactionId: string;
}

export interface WithdrawalRequest {
  amount: number;
  walletAddress: string;
}

export interface WithdrawalResponse {
  id: string;
  amount: number;
  walletAddress: string;
  status: string;
  requestedAt: Date;
  processedAt?: Date | null;
}

export interface DashboardStats {
  totalUsers: number;
  verifiedUsers: number;
  activeDraws: number;
  completedDraws: number;
  activeTickets: number;
  totalDeposits: number;
  totalWithdrawals: number;
  totalWalletBalance: number;
}

export interface DrawResult {
  drawId: string;
  totalTickets: number;
  prizePool: number;
  winners: {
    first: {
      userId: string;
      ticketNumber: string;
      location: string;
      prize: number;
    } | null;
    second: {
      userId: string;
      ticketNumber: string;
      location: string;
      prize: number;
    } | null;
    third: {
      userId: string;
      ticketNumber: string;
      location: string;
      prize: number;
    } | null;
  };
}

// JWT and Auth types
export interface JWTPayload {
  userId: string;
  email: string;
  username: string;
  role?: 'admin' | 'user';
}

export interface SignupRequest {
  fullName: string;
  email: string;
  username: string;
  location?: string;
  password: string;
  referredBy?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// OTP types
export interface OTPRequest {
  email: string;
}

export interface OTPVerifyRequest {
  email: string;
  otp: string;
}

// Admin types
export interface UserManagementFilter {
  role?: 'admin' | 'user';
  isEmailVerified?: boolean;
  page?: number;
  limit?: number;
  search?: string;
}

// Email types
export interface EmailData {
  email: string;
  otp: string;
  fullName: string;
}

export interface WelcomeEmailData {
  email: string;
  fullName: string;
  referralCode: string;
}
