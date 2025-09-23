import { Request, Response } from 'express';
import { DrawService } from '../services/drawService';

export const conductDraw = async (req: Request, res: Response) => {
  try {
    const results = await DrawService.conductExpiredDraws();
    
    res.json({
      message: 'Draws conducted successfully',
      results
    });
  } catch (error) {
    console.error('Conduct draw error:', error);
    
    if (error instanceof Error && error.message === 'No expired draws found') {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getDrawHistory = async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const draws = await DrawService.getDrawHistory(limit);
    
    res.json({ draws });
  } catch (error) {
    console.error('Get draw history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
