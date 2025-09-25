import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class NotificationService {
  static async createNotification(data: {
    userId?: string;
    title: string;
    message: string;
    type?: 'info' | 'success' | 'warning' | 'error';
    isGlobal?: boolean;
  }) {
    return prisma.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: data.type || 'info',
        isGlobal: data.isGlobal || false
      }
    });
  }

  static async getUserNotifications(userId: string, limit: number = 20) {
    return prisma.notification.findMany({
      where: {
        OR: [
          { userId },
          { isGlobal: true }
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
  }

  static async markAsRead(notificationId: string, userId: string) {
    return prisma.notification.updateMany({
      where: {
        id: notificationId,
        OR: [
          { userId },
          { isGlobal: true }
        ]
      },
      data: { isRead: true }
    });
  }

  static async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: {
        OR: [
          { userId },
          { isGlobal: true }
        ],
        isRead: false
      },
      data: { isRead: true }
    });
  }

  static async getUnreadCount(userId: string) {
    return prisma.notification.count({
      where: {
        OR: [
          { userId },
          { isGlobal: true }
        ],
        isRead: false
      }
    });
  }

  static async deleteNotification(notificationId: string, userId: string) {
    return prisma.notification.deleteMany({
      where: {
        id: notificationId,
        userId // Only allow deleting own notifications, not global ones
      }
    });
  }

  // Helper methods for common notifications
  static async notifyDeposit(userId: string, amount: number) {
    return this.createNotification({
      userId,
      title: 'Deposit Successful',
      message: `Your deposit of $${amount.toFixed(2)} has been processed successfully.`,
      type: 'success'
    });
  }

  static async notifyWithdrawal(userId: string, amount: number, status: 'approved' | 'rejected') {
    return this.createNotification({
      userId,
      title: `Withdrawal ${status === 'approved' ? 'Approved' : 'Rejected'}`,
      message: `Your withdrawal request of $${amount.toFixed(2)} has been ${status}.`,
      type: status === 'approved' ? 'success' : 'error'
    });
  }

  static async notifyTicketPurchase(userId: string, quantity: number, ticketTypeName: string) {
    return this.createNotification({
      userId,
      title: 'Tickets Purchased',
      message: `You have successfully purchased ${quantity} ${ticketTypeName} ticket${quantity > 1 ? 's' : ''}.`,
      type: 'success'
    });
  }

  static async notifyWin(userId: string, amount: number, prize: string) {
    return this.createNotification({
      userId,
      title: '🎉 Congratulations! You Won!',
      message: `You won the ${prize} prize of $${amount.toFixed(2)}! The amount has been added to your wallet.`,
      type: 'success'
    });
  }

  static async notifyDrawResult(drawId: string, totalTickets: number) {
    return this.createNotification({
      title: 'Draw Results Available',
      message: `The lottery draw with ${totalTickets} tickets has been completed. Check if you're a winner!`,
      type: 'info',
      isGlobal: true
    });
  }

  // Admin methods
  static async getAllNotifications(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    
    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              fullName: true,
              email: true
            }
          }
        }
      }),
      prisma.notification.count()
    ]);

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  static async sendGlobalNotification(data: {
    title: string;
    message: string;
    type?: 'info' | 'success' | 'warning' | 'error';
  }) {
    return this.createNotification({
      title: data.title,
      message: data.message,
      type: data.type || 'info',
      isGlobal: true
    });
  }
}