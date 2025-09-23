import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../utils/helpers';
import { Draw, User } from '../types';

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
}
