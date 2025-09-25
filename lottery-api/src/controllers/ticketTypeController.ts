import { Request, Response } from 'express';
import { TicketTypeService } from '../services/ticketTypeService';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    username: string;
    role: 'admin' | 'user';
  };
}

export const getAllTicketTypes = async (req: Request, res: Response) => {
  try {
    const activeOnly = req.query.active === 'true';
    const ticketTypes = await TicketTypeService.getAllTicketTypes(activeOnly);
    
    const formattedTypes = ticketTypes.map(type => ({
      ...type,
      price: type.price.toNumber()
    }));
    
    res.json({ ticketTypes: formattedTypes });
  } catch (error) {
    console.error('Get ticket types error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTicketTypeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const ticketType = await TicketTypeService.getTicketTypeById(id);
    
    if (!ticketType) {
      return res.status(404).json({ error: 'Ticket type not found' });
    }
    
    res.json({
      ticketType: {
        ...ticketType,
        price: ticketType.price.toNumber()
      }
    });
  } catch (error) {
    console.error('Get ticket type error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createTicketType = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, price, color } = req.body;
    
    if (!name || !price || price <= 0) {
      return res.status(400).json({ error: 'Name and valid price are required' });
    }
    
    const ticketType = await TicketTypeService.createTicketType({
      name,
      description,
      price: parseFloat(price),
      color
    });
    
    res.status(201).json({
      message: 'Ticket type created successfully',
      ticketType: {
        ...ticketType,
        price: ticketType.price.toNumber()
      }
    });
  } catch (error) {
    console.error('Create ticket type error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateTicketType = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, price, color, isActive } = req.body;
    
    const updateData: any = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price && price > 0) updateData.price = parseFloat(price);
    if (color) updateData.color = color;
    if (isActive !== undefined) updateData.isActive = isActive;
    
    const ticketType = await TicketTypeService.updateTicketType(id, updateData);
    
    res.json({
      message: 'Ticket type updated successfully',
      ticketType: {
        ...ticketType,
        price: ticketType.price.toNumber()
      }
    });
  } catch (error) {
    console.error('Update ticket type error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteTicketType = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    await TicketTypeService.deleteTicketType(id);
    
    res.json({ message: 'Ticket type deleted successfully' });
  } catch (error) {
    console.error('Delete ticket type error:', error);
    
    if (error instanceof Error && error.message.includes('Cannot delete ticket type')) {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTicketTypeStats = async (req: AuthRequest, res: Response) => {
  try {
    const stats = await TicketTypeService.getTicketTypeStats();
    res.json({ stats });
  } catch (error) {
    console.error('Get ticket type stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};