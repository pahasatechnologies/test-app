import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../utils/helpers';
import { Draw, User } from '../types';
import { NotificationService } from './notificationService';

const prisma = new PrismaClient();

export class AdminService {
  static async getDashboardStats() {
    const [
      totalUsers,
      verifiedUsers,
      activeDraws,
      completedDraws,
      activeTickets,
      totalDeposits,
      totalWithdrawals,
      totalWalletBalance
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'user' } }),
      prisma.user.count({ where: { isEmailVerified: true, role: 'user' } }),
      prisma.draw.count({ where: { status: 'active' } }),
      prisma.draw.count({ where: { status: 'completed' } }),
      prisma.ticket.count({ where: { status: 'active' } }),
      prisma.deposit.aggregate({
        where: { status: 'completed' },
        _sum: { amount: true }
      }),
      prisma.withdrawal.aggregate({
        where: { status: 'completed' },
        _sum: { amount: true }
      }),
      prisma.wallet.aggregate({
        _sum: { balance: true }
      })
    ]);

    return {
      totalUsers,
      verifiedUsers,
      activeDraws,
      completedDraws,
      activeTickets,
      totalDeposits: totalDeposits._sum.amount?.toNumber() || 0,
      totalWithdrawals: totalWithdrawals._sum.amount?.toNumber() || 0,
      totalWalletBalance: totalWalletBalance._sum.balance?.toNumber() || 0
    };
  }

  static async getAllUsers(filters: {
    page?: number;
    limit?: number;
    role?: string;
    isEmailVerified?: boolean;
    search?: string;
  }) {
    const { page = 1, limit = 20, role, isEmailVerified, search } = filters;

    const where: any = {};
    if (role) where.role = role;
    if (isEmailVerified !== undefined) where.isEmailVerified = isEmailVerified;
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          wallet: {
            select: { balance: true, totalDeposited: true }
          }
        }
      }),
      prisma.user.count({ where })
    ]);

    return {
      users: users.map((user: any) => ({
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        username: user.username,
        location: user.location,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        depositCount: user.depositCount,
        surpriseActivated: user.surpriseActivated,
        createdAt: user.createdAt,
        wallet: user.wallet ? {
          balance: user.wallet.balance.toNumber(),
          totalDeposited: user.wallet.totalDeposited.toNumber()
        } : null
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  static async getAllDraws() {
    const draws = await prisma.draw.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { tickets: true }
        }
      }
    });

    return draws.map((draw: any) => ({
      ...draw,
      prizePool: draw.prizePool.toNumber(),
      totalTickets: draw._count.tickets
    }));
  }

  static async getPendingWithdrawals() {
    const withdrawals = await prisma.withdrawal.findMany({
      where: { status: 'pending' },
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
            username: true
          }
        }
      },
      orderBy: { requestedAt: 'asc' }
    });

    return withdrawals.map((w: any) => ({
      ...w,
      amount: w.amount.toNumber()
    }));
  }

  static async processWithdrawal(withdrawalId: string, action: 'approve' | 'reject') {
    return prisma.$transaction(async (tx: any) => {
      const withdrawal = await tx.withdrawal.findUnique({
        where: { id: withdrawalId }
      });

      if (!withdrawal) {
        throw new Error('Withdrawal not found');
      }

      if (withdrawal.status !== 'pending') {
        throw new Error('Withdrawal already processed');
      }

      if (action === 'approve') {
        await tx.withdrawal.update({
          where: { id: withdrawalId },
          data: {
            status: 'completed',
            processedAt: new Date()
          }
        });

        await tx.wallet.update({
          where: { userId: withdrawal.userId },
          data: {
            totalWithdrawn: { increment: withdrawal.amount }
          }
        });
        
        await NotificationService.notifyWithdrawal(
          withdrawal.userId,
          withdrawal.amount.toNumber(),
          'approved'
        );
      } else {
        await tx.withdrawal.update({
          where: { id: withdrawalId },
          data: {
            status: 'rejected',
            processedAt: new Date()
          }
        });

        // Refund the amount back to user's wallet
        await tx.wallet.update({
          where: { userId: withdrawal.userId },
          data: {
            balance: { increment: withdrawal.amount }
          }
        });
        
        await NotificationService.notifyWithdrawal(
          withdrawal.userId,
          withdrawal.amount.toNumber(),
          'rejected'
        );
      }

      return { message: `Withdrawal ${action}d successfully` };
    });
  }

  static async createAdminUser(adminData: {
    fullName: string;
    email: string;
    username: string;
    password: string;
  }) {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: adminData.email },
          { username: adminData.username }
        ]
      }
    });

    if (existingUser) {
      throw new Error('User with this email or username already exists');
    }

    const hashedPassword = await hashPassword(adminData.password);

    const admin = await prisma.user.create({
      data: {
        ...adminData,
        password: hashedPassword,
        role: 'admin',
        isEmailVerified: true,
        referralCode: `ADMIN_${Date.now()}`
      }
    });

    return {
      id: admin.id,
      email: admin.email,
      username: admin.username,
      role: admin.role
    };
  }


  // System Configuration Management
  static async getSystemConfigs(category?: string) {
    const where: any = {};
    if (category) where.category = category;

    const configs = await prisma.systemConfig.findMany({
      where,
      orderBy: [
        { category: 'asc' },
        { key: 'asc' }
      ]
    });

    return configs;
  }

  static async getConfigByKey(key: string) {
    const config = await prisma.systemConfig.findUnique({
      where: { key }
    });

    if (!config) {
      const defaultValues: Record<string, string> = {
        'EMAIL_HOST': 'smtp.gmail.com',
        'EMAIL_PORT': '587',
        'EMAIL_USER': 'your-email@gmail.com',
        'EMAIL_PASS': 'your-app-password',
        'TICKET_PRICE': '100',
        'FIRST_PRIZE': '2000',
        'SECOND_PRIZE': '1000',
        'THIRD_PRIZE': '500',
        'REFERRAL_PERCENTAGE': '10',
        'WITHDRAWAL_FEE_PERCENTAGE': '10',
        'DEPOSIT_ADDRESS': 'your-crypto-deposit-address',
        'DRAW_DURATION_DAYS': '30',
        'SURPRISE_DEPOSIT_THRESHOLD': '5'
      };

      return process.env[key] || defaultValues[key] || null;
    }

    return config.value;
  }

  static async updateSystemConfig(key: string, value: string) {
    const existingConfig = await prisma.systemConfig.findUnique({
      where: { key }
    });

    if (!existingConfig) {
      throw new Error('Configuration key not found');
    }

    if (!existingConfig.isEditable) {
      throw new Error('This configuration is not editable');
    }

    return await prisma.systemConfig.update({
      where: { key },
      data: {
        value,
        updatedAt: new Date()
      }
    });
  }

  static async initializeDefaultConfigs() {
    const defaultConfigs = [
      // Email Configuration
      { key: 'EMAIL_HOST', value: process.env.EMAIL_HOST || 'smtp.gmail.com', description: 'SMTP server host for email', category: 'email' },
      { key: 'EMAIL_PORT', value: process.env.EMAIL_PORT || '587', description: 'SMTP server port', category: 'email' },
      { key: 'EMAIL_USER', value: process.env.EMAIL_USER || 'your-email@gmail.com', description: 'Email address for sending emails', category: 'email' },
      { key: 'EMAIL_PASS', value: process.env.EMAIL_PASS || 'your-app-password', description: 'Email password or app password', category: 'email' },

      // Lottery Configuration
      { key: 'TICKET_PRICE', value: process.env.TICKET_PRICE || '100', description: 'Price per lottery ticket', category: 'lottery' },
      { key: 'FIRST_PRIZE', value: process.env.FIRST_PRIZE || '2000', description: 'First prize amount', category: 'lottery' },
      { key: 'SECOND_PRIZE', value: process.env.SECOND_PRIZE || '1000', description: 'Second prize amount', category: 'lottery' },
      { key: 'THIRD_PRIZE', value: process.env.THIRD_PRIZE || '500', description: 'Third prize amount', category: 'lottery' },
      { key: 'REFERRAL_PERCENTAGE', value: process.env.REFERRAL_PERCENTAGE || '10', description: 'Referral commission percentage', category: 'lottery' },
      { key: 'WITHDRAWAL_FEE_PERCENTAGE', value: process.env.WITHDRAWAL_FEE_PERCENTAGE || '10', description: 'Withdrawal fee percentage', category: 'lottery' },
      { key: 'DEPOSIT_ADDRESS', value: process.env.DEPOSIT_ADDRESS || 'your-crypto-deposit-address', description: 'Crypto deposit address', category: 'lottery' },

      // Draw Configuration
      { key: 'DRAW_DURATION_DAYS', value: process.env.DRAW_DURATION_DAYS || '30', description: 'Duration of each draw in days', category: 'draw' },
      { key: 'SURPRISE_DEPOSIT_THRESHOLD', value: process.env.SURPRISE_DEPOSIT_THRESHOLD || '5', description: 'Minimum deposits to activate surprise', category: 'draw' }
    ];

    for (const config of defaultConfigs) {
      const existing = await prisma.systemConfig.findUnique({
        where: { key: config.key }
      });

      if (!existing) {
        await prisma.systemConfig.create({ data: config });
      }
    }

    return { message: 'Default configurations initialized successfully' };
  }
}
