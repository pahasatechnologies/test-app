import { PrismaClient } from '@prisma/client';
import { generateTicketNumber, getDaysRemaining, isDrawExpired } from '../utils/helpers';
import { CONFIG } from '../config/constants';

const prisma = new PrismaClient();

export class TicketService {
  static async getActiveDrawInfo() {
    const activeDraw = await prisma.draw.findFirst({
      where: {
        status: 'active',
        endDate: { gt: new Date() }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    if (!activeDraw) return null;
    
    return {
      id: activeDraw.id,
      startDate: activeDraw.startDate,
      endDate: activeDraw.endDate,
      totalTickets: activeDraw.totalTickets,
      prizePool: activeDraw.prizePool.toNumber(),
      daysRemaining: getDaysRemaining(activeDraw.endDate)
    };
  }

  static async purchaseTickets(purchaseData: {
    userId: string;
    quantity: number;
  }) {
    return prisma.$transaction(async (tx: any) => {
      const ticketPrice = CONFIG.LOTTERY?.TICKET_PRICE || 100;
      const totalCost = ticketPrice * purchaseData.quantity;
      
      // Check wallet balance
      const wallet = await tx.wallet.findUnique({
        where: { userId: purchaseData.userId }
      });
      
      if (!wallet || wallet.balance.toNumber() < totalCost) {
        throw new Error('Insufficient balance');
      }
      
      // Get or create active draw
      let draw = await tx.draw.findFirst({
        where: {
          status: 'active',
          endDate: { gt: new Date() }
        }
      });
      
      if (!draw) {
        const drawDurationDays = CONFIG.LOTTERY?.DRAW_DURATION_DAYS || 30;
        const startDate = new Date();
        const endDate = new Date(startDate.getTime() + (drawDurationDays * 24 * 60 * 60 * 1000));
        
        draw = await tx.draw.create({
          data: {
            startDate,
            endDate,
            status: 'active'
          }
        });
      }
      
      if (isDrawExpired(draw.endDate)) {
        throw new Error('Current draw has expired');
      }
      
      // Create tickets
      const tickets = [];
      for (let i = 0; i < purchaseData.quantity; i++) {
        const ticket = await tx.ticket.create({
          data: {
            userId: purchaseData.userId,
            ticketNumber: generateTicketNumber(),
            purchasePrice: ticketPrice,
            drawId: draw.id
          }
        });
        tickets.push(ticket);
      }
      
      // Update wallet balance
      await tx.wallet.update({
        where: { userId: purchaseData.userId },
        data: {
          balance: { decrement: totalCost }
        }
      });
      
      // Update draw statistics
      await tx.draw.update({
        where: { id: draw.id },
        data: {
          totalTickets: { increment: purchaseData.quantity },
          prizePool: { increment: totalCost }
        }
      });
      
      return { tickets, totalCost, drawId: draw.id };
    });
  }

  static async getUserTickets(userId: string) {
    return prisma.ticket.findMany({
      where: { userId },
      include: {
        draw: {
          select: {
            id: true,
            startDate: true,
            endDate: true,
            status: true,
            prizePool: true
          }
        }
      },
      orderBy: { purchasedAt: 'desc' }
    });
  }
}
