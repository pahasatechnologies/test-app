import { Request, Response } from 'express';
import { TicketService } from '../services/ticketService';
import { CONFIG } from '../config/constants';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    username: string;
  };
}

export const getTicketInfo = async (req: Request, res: Response) => {
  try {
    const ticketInfo = await TicketService.getTicketInfo();
    
    res.json({
      currentDraw: ticketInfo.currentDraw,
      ticketTypes: ticketInfo.ticketTypes,
      prizes: {
        first: CONFIG.LOTTERY.FIRST_PRIZE,
        second: CONFIG.LOTTERY.SECOND_PRIZE,
        third: CONFIG.LOTTERY.THIRD_PRIZE
      }
    });
  } catch (error) {
    console.error('Get ticket info error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const purchaseTicket = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { quantity, ticketTypeId } = req.body;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    if (!ticketTypeId) {
      return res.status(400).json({ error: 'Ticket type is required' });
    }
    
    if (!quantity || quantity < 1 || quantity > 10) {
      return res.status(400).json({ error: 'Quantity must be between 1 and 10' });
    }
    
    const result = await TicketService.purchaseTickets({ 
      userId, 
      ticketTypeId,
      quantity 
    });
    
    res.json({
      message: `Successfully purchased ${quantity} ${result.ticketType.name} ticket(s)`,
      tickets: result.tickets.map((ticket: any) => ({
        id: ticket.id,
        ticketNumber: ticket.ticketNumber,
        purchasePrice: ticket.purchasePrice.toNumber()
      })),
      totalCost: result.totalCost,
      drawId: result.drawId
    });
  } catch (error) {
    console.error('Purchase ticket error:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Insufficient balance' || 
          error.message === 'Current draw has expired' ||
          error.message === 'Invalid or inactive ticket type') {
        return res.status(400).json({ error: error.message });
      }
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUserTickets = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const tickets = await TicketService.getUserTickets(userId);
    
    const formattedTickets = tickets.map((ticket: any) => ({
      id: ticket.id,
      ticketNumber: ticket.ticketNumber,
      purchasePrice: ticket.purchasePrice.toNumber(),
      status: ticket.status,
      purchasedAt: ticket.purchasedAt,
      ticketType: ticket.ticketType ? {
        ...ticket.ticketType,
        price: ticket.ticketType.price.toNumber()
      } : null,
      draw: {
        ...ticket.draw,
        prizePool: ticket.draw.prizePool.toNumber()
      }
    }));
    
    res.json({ tickets: formattedTickets });
  } catch (error) {
    console.error('Get user tickets error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
