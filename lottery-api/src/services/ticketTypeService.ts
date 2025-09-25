import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class TicketTypeService {
  static async getAllTicketTypes(activeOnly: boolean = false) {
    const where = activeOnly ? { isActive: true } : {};
    
    return prisma.ticketType.findMany({
      where,
      orderBy: { createdAt: 'asc' }
    });
  }

  static async getTicketTypeById(id: string) {
    return prisma.ticketType.findUnique({
      where: { id }
    });
  }

  static async createTicketType(data: {
    name: string;
    description?: string;
    price: number;
    color?: string;
  }) {
    return prisma.ticketType.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        color: data.color || '#3B82F6'
      }
    });
  }

  static async updateTicketType(id: string, data: {
    name?: string;
    description?: string;
    price?: number;
    color?: string;
    isActive?: boolean;
  }) {
    return prisma.ticketType.update({
      where: { id },
      data
    });
  }

  static async deleteTicketType(id: string) {
    // Check if ticket type is being used
    const ticketCount = await prisma.ticket.count({
      where: { ticketTypeId: id }
    });

    if (ticketCount > 0) {
      throw new Error('Cannot delete ticket type that has been used for tickets');
    }

    return prisma.ticketType.delete({
      where: { id }
    });
  }

  static async getTicketTypeStats() {
    const stats = await prisma.ticketType.findMany({
      include: {
        _count: {
          select: { tickets: true }
        }
      }
    });

    return stats.map(type => ({
      ...type,
      price: type.price.toNumber(),
      ticketsSold: type._count.tickets
    }));
  }
}