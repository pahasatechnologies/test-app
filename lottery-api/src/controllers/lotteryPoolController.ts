import { Request, Response } from 'express';
import { LotteryPoolService } from '../services/lotteryPoolService';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    username: string;
    role: 'admin' | 'user';
  };
}

export const getAvailablePools = async (req: Request, res: Response) => {
  try {
    const pools = await LotteryPoolService.getAvailablePools();
    
    const formattedPools = pools.map((pool: any) => ({
      ...pool,
      entryFee: pool.entryFee.toNumber(),
      firstPrize: pool.firstPrize.toNumber(),
      secondPrize: pool.secondPrize.toNumber(),
      thirdPrize: pool.thirdPrize.toNumber(),
      participationFee: pool.participationFee.toNumber(),
      networkFee: pool.networkFee.toNumber(),
      refundAmount: pool.refundAmount.toNumber()
    }));
    
    res.json({ pools: formattedPools });
  } catch (error) {
    console.error('Get available pools error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const joinPool = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { poolType } = req.body;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    if (!poolType || !['100', '500', '1000'].includes(poolType)) {
      return res.status(400).json({ error: 'Invalid pool type' });
    }
    
    const result = await LotteryPoolService.joinPool(userId, poolType);
    
    res.json({
      message: `Successfully joined $${poolType} lottery pool`,
      participant: {
        ...result.participant,
        entryAmount: result.participant.entryAmount.toNumber(),
        participationFee: result.participant.participationFee.toNumber(),
        networkFee: result.participant.networkFee.toNumber()
      },
      pool: {
        ...result.pool,
        entryFee: result.pool.entryFee.toNumber()
      }
    });
  } catch (error) {
    console.error('Join pool error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('already joined') || 
          error.message.includes('Insufficient balance') ||
          error.message.includes('No available')) {
        return res.status(400).json({ error: error.message });
      }
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUserPoolHistory = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const history = await LotteryPoolService.getUserPoolHistory(userId);
    
    const formattedHistory = history.map((participation: any) => ({
      ...participation,
      entryAmount: participation.entryAmount.toNumber(),
      participationFee: participation.participationFee.toNumber(),
      networkFee: participation.networkFee.toNumber(),
      prizeWon: participation.prizeWon?.toNumber() || 0,
      pool: {
        ...participation.pool,
        entryFee: participation.pool.entryFee.toNumber()
      }
    }));
    
    res.json({ history: formattedHistory });
  } catch (error) {
    console.error('Get user pool history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUserTclTokens = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const tokens = await LotteryPoolService.getUserTclTokens(userId);
    
    if (!tokens) {
      return res.json({
        tokens: {
          balance: 0,
          totalEarned: 0,
          isWithdrawable: false
        }
      });
    }
    
    res.json({
      tokens: {
        ...tokens,
        balance: tokens.balance.toNumber(),
        totalEarned: tokens.totalEarned.toNumber()
      }
    });
  } catch (error) {
    console.error('Get user TCL tokens error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUserRefunds = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const refunds = await LotteryPoolService.getUserRefunds(userId);
    
    const formattedRefunds = refunds.map((refund: any) => ({
      ...refund,
      refundAmount: refund.refundAmount.toNumber(),
      pool: {
        ...refund.pool,
        entryFee: refund.pool.entryFee.toNumber()
      }
    }));
    
    res.json({ refunds: formattedRefunds });
  } catch (error) {
    console.error('Get user refunds error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Admin endpoint to manually conduct draw
export const conductPoolDraw = async (req: AuthRequest, res: Response) => {
  try {
    const { poolId } = req.body;
    
    if (!poolId) {
      return res.status(400).json({ error: 'Pool ID is required' });
    }
    
    const result = await LotteryPoolService.conductPoolDraw(poolId);
    
    res.json({
      message: 'Pool draw conducted successfully',
      result: {
        pool: {
          ...result.pool,
          entryFee: result.pool.entryFee.toNumber(),
          firstPrize: result.pool.firstPrize.toNumber(),
          secondPrize: result.pool.secondPrize.toNumber(),
          thirdPrize: result.pool.thirdPrize.toNumber()
        },
        winners: result.winners.map((winner: any) => ({
          ...winner,
          prize: winner.prize.toNumber()
        }))
      }
    });
  } catch (error) {
    console.error('Conduct pool draw error:', error);
    
    if (error instanceof Error && error.message.includes('not ready')) {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
};