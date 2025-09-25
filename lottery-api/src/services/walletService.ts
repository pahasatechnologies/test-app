import { PrismaClient } from '@prisma/client';
import { calculateWithdrawalAmount, calculateReferralEarnings } from '../utils/helpers';
import { CONFIG } from '../config/constants';
import { NotificationService } from './notificationService';

const prisma = new PrismaClient();

export class WalletService {
  static async getWalletWithUser(userId: string) {
    return prisma.wallet.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            depositCount: true,
            surpriseActivated: true
          }
        }
      }
    });
  }

  static async processDeposit(depositData: {
    userId: string;
    amount: number;
    transactionId: string;
  }) {
    return prisma.$transaction(async (tx: any) => {
      // Check for existing transaction
      const existingDeposit = await tx.deposit.findUnique({
        where: { transactionId: depositData.transactionId }
      });
      
      if (existingDeposit) {
        throw new Error('Transaction already processed');
      }
      
      // Create deposit record
      const deposit = await tx.deposit.create({
        data: {
          userId: depositData.userId,
          amount: depositData.amount,
          transactionId: depositData.transactionId,
          status: 'completed'
        }
      });
      
      // Update wallet balances
      await tx.wallet.update({
        where: { userId: depositData.userId },
        data: {
          balance: { increment: depositData.amount },
          totalDeposited: { increment: depositData.amount }
        }
      });
      
      // Update user deposit count and surprise activation
      const user = await tx.user.findUnique({
        where: { id: depositData.userId },
        select: { depositCount: true, referredBy: true }
      });
      
      const newDepositCount = user!.depositCount + 1;
      const shouldActivateSurprise = newDepositCount >= (CONFIG.LOTTERY?.SURPRISE_DEPOSIT_THRESHOLD || 5);
      
      await tx.user.update({
        where: { id: depositData.userId },
        data: {
          depositCount: newDepositCount,
          surpriseActivated: shouldActivateSurprise
        }
      });
      
      // Handle referral earnings if user was referred
      if (user?.referredBy) {
        const referralAmount = calculateReferralEarnings(depositData.amount);
        await tx.wallet.update({
          where: { userId: user.referredBy },
          data: {
            referralEarnings: { increment: referralAmount },
            balance: { increment: referralAmount }
          }
        });
      }
      
      // Send notification
      await NotificationService.notifyDeposit(depositData.userId, depositData.amount);
      
      return deposit;
    });
  }

  static async createWithdrawalRequest(withdrawalData: {
    userId: string;
    amount: number;
    walletAddress: string;
  }) {
    return prisma.$transaction(async (tx: any) => {
      // Get wallet information
      const wallet = await tx.wallet.findUnique({
        where: { userId: withdrawalData.userId }
      });
      
      if (!wallet) {
        throw new Error('Wallet not found');
      }
      
      // Calculate maximum withdrawal amount
      const maxWithdrawalAmount = calculateWithdrawalAmount(
        wallet.totalDeposited.toNumber(),
        wallet.referralEarnings.toNumber()
      );
      
      if (withdrawalData.amount > maxWithdrawalAmount) {
        throw new Error(`Maximum withdrawal amount is $${maxWithdrawalAmount.toFixed(2)}`);
      }
      
      if (withdrawalData.amount > wallet.balance.toNumber()) {
        throw new Error('Insufficient balance');
      }
      
      // Check for active draws
      const activeDraw = await tx.draw.findFirst({
        where: { 
          status: 'active',
          endDate: { gt: new Date() }
        }
      });
      
      if (activeDraw) {
        throw new Error('Withdrawals are only allowed after winner declaration');
      }
      
      // Create withdrawal request
      const withdrawal = await tx.withdrawal.create({
        data: {
          userId: withdrawalData.userId,
          amount: withdrawalData.amount,
          walletAddress: withdrawalData.walletAddress,
          status: 'pending'
        }
      });
      
      // Update wallet balance
      await tx.wallet.update({
        where: { userId: withdrawalData.userId },
        data: {
          balance: { decrement: withdrawalData.amount }
        }
      });
      
      return withdrawal;
    });
  }

  static async getUserWithdrawals(userId: string) {
    return prisma.withdrawal.findMany({
      where: { userId },
      orderBy: { requestedAt: 'desc' }
    });
  }
}
