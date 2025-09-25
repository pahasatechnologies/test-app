import { PrismaClient } from '@prisma/client';
import { generateTicketNumber, getDaysRemaining, isDrawExpired } from '../utils/helpers';
import { CONFIG } from '../config/constants';
import { NotificationService } from './notificationService';

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

  static async getTicketInfo() {
    const [currentDraw, ticketTypes] = await Promise.all([
      this.getActiveDrawInfo(),
      prisma.ticketType.findMany({
        where: { isActive: true },
        orderBy: { price: 'asc' }
      })
    ]);

    return {
      currentDraw,
      ticketTypes: ticketTypes.map(type => ({
        ...type,
        price: type.price.toNumber()
      }))
    };
  }

  static async purchaseTickets(purchaseData: {
    userId: string;
    ticketTypeId: string;
    ticketTypeId: string;
    quantity: number;
  }) {
    return prisma.$transaction(async (tx: any) => {
      // Get ticket type
      const ticketType = await tx.ticketType.findUnique({
        where: { id: purchaseData.ticketTypeId }
      });
      
      if (!ticketType || !ticketType.isActive) {
        throw new Error('Invalid or inactive ticket type');
      }
      
      const ticketPrice = ticketType.price.toNumber();
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
            ticketTypeId: purchaseData.ticketTypeId,
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
      
      // Send notification
      await NotificationService.notifyTicketPurchase(
        purchaseData.userId,
        purchaseData.quantity,
        ticketType.name
      );
      
      return { tickets, totalCost, drawId: draw.id, ticketType };
    });
  }

  static async getUserTickets(userId: string) {
    return prisma.ticket.findMany({
      where: { userId },
      include: {
        ticketType: true,
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
