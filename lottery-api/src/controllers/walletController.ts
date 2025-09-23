// controllers/walletController.ts
import { Request, Response } from 'express';
import { WalletService } from '../services/walletService';
import { calculateWithdrawalAmount } from '../utils/helpers';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    username: string;
  };
}

interface DepositRequest {
  amount: number;
  transactionId: string;
}

interface WithdrawalRequest {
  amount: number;
  walletAddress: string;
}


export const getWallet = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const walletData = await WalletService.getWalletWithUser(userId);
    
    if (!walletData) {
      return res.status(404).json({ error: 'Wallet not found' });
    }
    
    const maxWithdrawalAmount = calculateWithdrawalAmount(
      walletData.totalDeposited.toNumber(),
      walletData.referralEarnings.toNumber()
    );
    
    res.json({
      wallet: {
        id: walletData.id,
        balance: walletData.balance.toNumber(),
        depositAddress: walletData.depositAddress,
        totalDeposited: walletData.totalDeposited.toNumber(),
        totalWithdrawn: walletData.totalWithdrawn.toNumber(),
        referralEarnings: walletData.referralEarnings.toNumber(),
        maxWithdrawalAmount,
        depositCount: walletData.user.depositCount,
        surpriseActivated: walletData.user.surpriseActivated
      }
    });
    
  } catch (error) {
    console.error('Get wallet error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const processDeposit = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { amount, transactionId } = req.body;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }
    
    if (!transactionId) {
      return res.status(400).json({ error: 'Transaction ID is required' });
    }
    
    const deposit = await WalletService.processDeposit({
      userId,
      amount,
      transactionId
    });
    
    res.json({
      message: 'Deposit processed successfully',
      deposit: {
        id: deposit.id,
        amount: deposit.amount.toNumber(),
        transactionId: deposit.transactionId,
        status: deposit.status
      }
    });
    
  } catch (error) {
    console.error('Process deposit error:', error);
    
    if (error instanceof Error && error.message === 'Transaction already processed') {
      return res.status(409).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const requestWithdrawal = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { amount, walletAddress } = req.body;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const withdrawal = await WalletService.createWithdrawalRequest({
      userId,
      amount,
      walletAddress
    });
    
    res.json({
      message: 'Withdrawal request submitted successfully',
      withdrawal: {
        id: withdrawal.id,
        amount: withdrawal.amount.toNumber(),
        walletAddress: withdrawal.walletAddress,
        status: withdrawal.status,
        requestedAt: withdrawal.requestedAt
      }
    });
    
  } catch (error) {
    console.error('Request withdrawal error:', error);
    
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getWithdrawals = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const withdrawals = await WalletService.getUserWithdrawals(userId);
    
    const withdrawalsResponse = withdrawals.map((withdrawal: any) => ({
      id: withdrawal.id,
      amount: withdrawal.amount.toNumber(),
      walletAddress: withdrawal.walletAddress,
      status: withdrawal.status,
      requestedAt: withdrawal.requestedAt,
      processedAt: withdrawal.processedAt
    }));
    
    res.json({ withdrawals: withdrawalsResponse });
    
  } catch (error) {
    console.error('Get withdrawals error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
