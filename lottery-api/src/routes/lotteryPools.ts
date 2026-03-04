import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import {
  getAvailablePools,
  joinPool,
  getUserPoolHistory,
  getUserTclTokens,
  getUserRefunds,
  conductPoolDraw
} from '../controllers/lotteryPoolController';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: LotteryPools
 *   description: Decentralized lottery pool operations
 */

// Public routes
router.get('/available', getAvailablePools);

// User routes (require authentication)
router.use(authenticateToken);
router.post('/join', joinPool);
router.get('/my-history', getUserPoolHistory);
router.get('/my-tcl-tokens', getUserTclTokens);
router.get('/my-refunds', getUserRefunds);

// Admin routes
router.post('/conduct-draw', requireAdmin, conductPoolDraw);

export default router;