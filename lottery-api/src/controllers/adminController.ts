import { Request, Response } from 'express';
import { AdminService } from '../services/adminService';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    username: string;
    role: 'admin' | 'user';
  };
}

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const stats = await AdminService.getDashboardStats();
    res.json({ stats });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const filters = {
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
      role: req.query.role as string,
      isEmailVerified: req.query.isEmailVerified ? req.query.isEmailVerified === 'true' : undefined,
      search: req.query.search as string
    };

    const result = await AdminService.getAllUsers(filters);
    res.json(result);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllDraws = async (req: AuthRequest, res: Response) => {
  try {
    const draws = await AdminService.getAllDraws();
    res.json({ draws });
  } catch (error) {
    console.error('Get all draws error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPendingWithdrawals = async (req: AuthRequest, res: Response) => {
  try {
    const withdrawals = await AdminService.getPendingWithdrawals();
    res.json({ withdrawals });
  } catch (error) {
    console.error('Get pending withdrawals error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const processWithdrawal = async (req: AuthRequest, res: Response) => {
  try {
    const { withdrawalId, action } = req.body;
    
    if (!withdrawalId || !['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Invalid withdrawal ID or action' });
    }

    const result = await AdminService.processWithdrawal(withdrawalId, action);
    res.json(result);
  } catch (error) {
    console.error('Process withdrawal error:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Withdrawal not found' || 
          error.message === 'Withdrawal already processed') {
        return res.status(400).json({ error: error.message });
      }
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getSystemConfig = async (req: AuthRequest, res: Response) => {
  try {
    const config = {
      ticketPrice: process.env.TICKET_PRICE || 100,
      firstPrize: process.env.FIRST_PRIZE || 2000,
      secondPrize: process.env.SECOND_PRIZE || 1000,
      thirdPrize: process.env.THIRD_PRIZE || 500,
      referralPercentage: process.env.REFERRAL_PERCENTAGE || 10,
      withdrawalFeePercentage: process.env.WITHDRAWAL_FEE_PERCENTAGE || 10,
      drawDurationDays: process.env.DRAW_DURATION_DAYS || 30,
      surpriseDepositThreshold: process.env.SURPRISE_DEPOSIT_THRESHOLD || 5
    };

    res.json({ config });
  } catch (error) {
    console.error('Get system config error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createAdminUser = async (req: AuthRequest, res: Response) => {
  try {
    const { fullName, email, username, password } = req.body;
    
    if (!fullName || !email || !username || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const admin = await AdminService.createAdminUser({
      fullName,
      email,
      username,
      password
    });

    res.status(201).json({
      message: 'Admin user created successfully',
      admin
    });
  } catch (error) {
    console.error('Create admin user error:', error);
    
    if (error instanceof Error && error.message === 'User with this email or username already exists') {
      return res.status(409).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
};
