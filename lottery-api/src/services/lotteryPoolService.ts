import { PrismaClient } from '@prisma/client';
import { NotificationService } from './notificationService';

const prisma = new PrismaClient();

export class LotteryPoolService {
  static async getAvailablePools() {
    return prisma.lotteryPool.findMany({
      where: {
        status: 'active',
        currentParticipants: {
          lt: prisma.lotteryPool.fields.maxParticipants
        }
      },
      orderBy: { entryFee: 'asc' }
    });
  }

  static async joinPool(userId: string, poolType: string) {
    return prisma.$transaction(async (tx: any) => {
      // Find available pool of the specified type
      const pool = await tx.lotteryPool.findFirst({
        where: {
          poolType,
          status: 'active',
          currentParticipants: {
            lt: tx.lotteryPool.fields.maxParticipants
          }
        }
      });

      if (!pool) {
        throw new Error(`No available ${poolType} pool found`);
      }

      // Check if user already joined this pool
      const existingParticipation = await tx.poolParticipant.findUnique({
        where: {
          poolId_userId: {
            poolId: pool.id,
            userId
          }
        }
      });

      if (existingParticipation) {
        throw new Error('You have already joined this pool');
      }

      // Check user wallet balance
      const wallet = await tx.wallet.findUnique({
        where: { userId }
      });

      if (!wallet || wallet.balance.toNumber() < pool.entryFee.toNumber()) {
        throw new Error('Insufficient balance');
      }

      // Deduct entry fee from wallet
      await tx.wallet.update({
        where: { userId },
        data: {
          balance: { decrement: pool.entryFee }
        }
      });

      // Add participant to pool
      const participant = await tx.poolParticipant.create({
        data: {
          poolId: pool.id,
          userId,
          entryAmount: pool.entryFee,
          participationFee: pool.participationFee,
          networkFee: pool.networkFee
        }
      });

      // Update pool participant count
      const updatedPool = await tx.lotteryPool.update({
        where: { id: pool.id },
        data: {
          currentParticipants: { increment: 1 }
        }
      });

      // Add TCL tokens (1:1 ratio with entry fee)
      await tx.tclToken.upsert({
        where: { userId },
        update: {
          balance: { increment: pool.entryFee },
          totalEarned: { increment: pool.entryFee }
        },
        create: {
          userId,
          balance: pool.entryFee,
          totalEarned: pool.entryFee
        }
      });

      // Check if pool is now full
      if (updatedPool.currentParticipants >= updatedPool.maxParticipants) {
        await tx.lotteryPool.update({
          where: { id: pool.id },
          data: { status: 'full' }
        });

        // Schedule draw (in real implementation, this would trigger a job)
        await this.schedulePoolDraw(pool.id);
      }

      // Handle referral bonus
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { referredBy: true }
      });

      if (user?.referredBy) {
        const referralBonus = pool.entryFee.toNumber() * 0.1; // 10% referral bonus
        await tx.wallet.update({
          where: { userId: user.referredBy },
          data: {
            balance: { increment: referralBonus },
            referralEarnings: { increment: referralBonus }
          }
        });

        // Notify referrer
        await NotificationService.createNotification({
          userId: user.referredBy,
          title: 'Referral Bonus Earned!',
          message: `You earned $${referralBonus.toFixed(2)} from a successful referral.`,
          type: 'success'
        });
      }

      // Send confirmation notification
      await NotificationService.createNotification({
        userId,
        title: 'Pool Entry Successful!',
        message: `You have successfully joined the $${pool.entryFee} lottery pool. ${pool.entryFee} TCL tokens added to your account.`,
        type: 'success'
      });

      return { participant, pool: updatedPool };
    });
  }

  static async conductPoolDraw(poolId: string) {
    return prisma.$transaction(async (tx: any) => {
      const pool = await tx.lotteryPool.findUnique({
        where: { id: poolId },
        include: {
          participants: {
            include: {
              user: {
                select: { id: true, fullName: true, email: true }
              }
            }
          }
        }
      });

      if (!pool || pool.status !== 'full') {
        throw new Error('Pool not ready for draw');
      }

      // Randomly select winners
      const participants = pool.participants;
      const shuffled = participants.sort(() => Math.random() - 0.5);

      const firstWinner = shuffled[0];
      const secondWinner = shuffled[1];
      const thirdWinner = shuffled[2];

      // Update pool with winners
      await tx.lotteryPool.update({
        where: { id: poolId },
        data: {
          status: 'completed',
          firstWinnerId: firstWinner?.userId,
          secondWinnerId: secondWinner?.userId,
          thirdWinnerId: thirdWinner?.userId,
          completedAt: new Date()
        }
      });

      // Award prizes to winners
      const winners = [
        { participant: firstWinner, prize: pool.firstPrize, position: 'First' },
        { participant: secondWinner, prize: pool.secondPrize, position: 'Second' },
        { participant: thirdWinner, prize: pool.thirdPrize, position: 'Third' }
      ];

      for (const winner of winners) {
        if (winner.participant) {
          // Update participant as winner
          await tx.poolParticipant.update({
            where: { id: winner.participant.id },
            data: {
              isWinner: true,
              prizeWon: winner.prize
            }
          });

          // Add prize to wallet
          await tx.wallet.update({
            where: { userId: winner.participant.userId },
            data: {
              balance: { increment: winner.prize }
            }
          });

          // Notify winner
          await NotificationService.createNotification({
            userId: winner.participant.userId,
            title: `🎉 Congratulations! You Won ${winner.position} Prize!`,
            message: `You won $${winner.prize.toNumber().toFixed(2)} in the $${pool.entryFee} lottery pool!`,
            type: 'success'
          });
        }
      }

      // Process 80% refunds for non-winners
      await this.processPoolRefunds(poolId);

      // Send global notification about draw results
      await NotificationService.sendGlobalNotification({
        title: 'Lottery Draw Completed!',
        message: `The $${pool.entryFee} lottery pool draw has been completed. Check if you're a winner!`,
        type: 'info'
      });

      return { pool, winners };
    });
  }

  static async processPoolRefunds(poolId: string) {
    return prisma.$transaction(async (tx: any) => {
      const pool = await tx.lotteryPool.findUnique({
        where: { id: poolId },
        include: {
          participants: {
            where: { isWinner: false }
          }
        }
      });

      if (!pool) {
        throw new Error('Pool not found');
      }

      // Process 80% refunds for non-winners
      for (const participant of pool.participants) {
        const refundAmount = pool.refundAmount;

        // Create refund transaction
        await tx.refundTransaction.create({
          data: {
            poolId,
            userId: participant.userId,
            refundAmount,
            status: 'completed',
            processedAt: new Date()
          }
        });

        // Add refund to wallet
        await tx.wallet.update({
          where: { userId: participant.userId },
          data: {
            balance: { increment: refundAmount }
          }
        });

        // Update participant refund status
        await tx.poolParticipant.update({
          where: { id: participant.id },
          data: { refundProcessed: true }
        });

        // Notify about refund
        await NotificationService.createNotification({
          userId: participant.userId,
          title: '80% Refund Processed',
          message: `Your 80% refund of $${refundAmount.toNumber().toFixed(2)} has been processed and added to your wallet.`,
          type: 'success'
        });
      }
    });
  }

  static async getUserPoolHistory(userId: string) {
    return prisma.poolParticipant.findMany({
      where: { userId },
      include: {
        pool: {
          select: {
            poolType: true,
            entryFee: true,
            status: true,
            completedAt: true,
            firstWinnerId: true,
            secondWinnerId: true,
            thirdWinnerId: true
          }
        }
      },
      orderBy: { joinedAt: 'desc' }
    });
  }

  static async getUserTclTokens(userId: string) {
    return prisma.tclToken.findUnique({
      where: { userId }
    });
  }

  static async getUserRefunds(userId: string) {
    return prisma.refundTransaction.findMany({
      where: { userId },
      include: {
        pool: {
          select: {
            poolType: true,
            entryFee: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  private static async schedulePoolDraw(poolId: string) {
    // In a real implementation, this would schedule a job
    // For now, we'll conduct the draw immediately
    setTimeout(async () => {
      try {
        await this.conductPoolDraw(poolId);
      } catch (error) {
        console.error('Error conducting pool draw:', error);
      }
    }, 5000); // 5 second delay for demo
  }
}