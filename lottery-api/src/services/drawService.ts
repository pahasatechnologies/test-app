import { PrismaClient } from '@prisma/client';
import { CONFIG } from '../config/constants';

const prisma = new PrismaClient();

export class DrawService {
  static async conductExpiredDraws() {
    return prisma.$transaction(async (tx: any) => {
      // Get expired draws
      const expiredDraws = await tx.draw.findMany({
        where: {
          status: 'active',
          endDate: { lte: new Date() }
        }
      });

      if (expiredDraws.length === 0) {
        throw new Error('No expired draws found');
      }

      const results = [];

      for (const draw of expiredDraws) {
        // Get all tickets for this draw
        const tickets = await tx.ticket.findMany({
          where: { 
            drawId: draw.id,
            status: 'active'
          },
          include: {
            user: {
              select: { location: true }
            }
          }
        });

        if (tickets.length === 0) {
          await tx.draw.update({
            where: { id: draw.id },
            data: { status: 'cancelled' }
          });
          continue;
        }

        // Group tickets by location and randomly select winners
        const locationGroups = tickets.reduce((groups: any, ticket: any) => {
          const location = ticket.user.location || 'Unknown';
          if (!groups[location]) groups[location] = [];
          groups[location].push(ticket);
          return groups;
        }, {});

        // Try to select winners from different locations when possible
        const allTickets = Object.values(locationGroups).flat() as any[];
        const shuffled = allTickets.sort(() => Math.random() - 0.5);

        const winners = {
          first: shuffled[0] || null,
          second: shuffled[1] || null,
          third: shuffled[2] || null
        };

        // Update draw with winners
        await tx.draw.update({
          where: { id: draw.id },
          data: {
            status: 'completed',
            firstPrizeWinner: winners.first?.userId,
            secondPrizeWinner: winners.second?.userId,
            thirdPrizeWinner: winners.third?.userId
          }
        });

        // Award prizes to winners
        const prizes = {
          first: CONFIG.LOTTERY?.FIRST_PRIZE || 2000,
          second: CONFIG.LOTTERY?.SECOND_PRIZE || 1000,
          third: CONFIG.LOTTERY?.THIRD_PRIZE || 500
        };

        if (winners.first) {
          await tx.wallet.update({
            where: { userId: winners.first.userId },
            data: { balance: { increment: prizes.first } }
          });
        }

        if (winners.second) {
          await tx.wallet.update({
            where: { userId: winners.second.userId },
            data: { balance: { increment: prizes.second } }
          });
        }

        if (winners.third) {
          await tx.wallet.update({
            where: { userId: winners.third.userId },
            data: { balance: { increment: prizes.third } }
          });
        }

        results.push({
          drawId: draw.id,
          totalTickets: tickets.length,
          prizePool: draw.prizePool.toNumber(),
          winners: {
            first: winners.first ? {
              userId: winners.first.userId,
              ticketNumber: winners.first.ticketNumber,
              location: winners.first.user.location,
              prize: prizes.first
            } : null,
            second: winners.second ? {
              userId: winners.second.userId,
              ticketNumber: winners.second.ticketNumber,
              location: winners.second.user.location,
              prize: prizes.second
            } : null,
            third: winners.third ? {
              userId: winners.third.userId,
              ticketNumber: winners.third.ticketNumber,
              location: winners.third.user.location,
              prize: prizes.third
            } : null
          }
        });
      }

      return results;
    });
  }

  static async getDrawHistory(limit?: number) {
    const draws = await prisma.draw.findMany({
      where: { status: 'completed' },
      orderBy: { createdAt: 'desc' },
      take: limit || 10,
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
}
