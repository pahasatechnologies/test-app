import { Router } from 'express';
import { getWallet, processDeposit, requestWithdrawal, getWithdrawals } from '../controllers/walletController';
import { authenticateToken } from '../middleware/auth';
import { validateWithdrawal } from '../middleware/validation';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Wallet
 *   description: User wallet operations and transactions
 */

/**
 * @swagger
 * /api/wallet:
 *   get:
 *     summary: Get user wallet details
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wallet details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Wallet'
 *       401:
 *         description: Unauthorized, authentication token is missing or invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', authenticateToken, getWallet);

/**
 * @swagger
 * /api/wallet/deposit:
 *   post:
 *     summary: Process a deposit to the user's wallet
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - transactionRef
 *             properties:
 *               amount:
 *                 type: number
 *                 format: decimal
 *                 example: 50.00
 *               transactionRef:
 *                 type: string
 *                 example: DEP123456789
 *     responses:
 *       200:
 *         description: Deposit processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Invalid deposit amount or transaction reference
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/deposit', authenticateToken, processDeposit);

/**
 * @swagger
 * /api/wallet/withdraw:
 *   post:
 *     summary: Request a withdrawal from the user's wallet
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - recipientAddress
 *             properties:
 *               amount:
 *                 type: number
 *                 format: decimal
 *                 example: 25.00
 *               recipientAddress:
 *                 type: string
 *                 example: 0x123abc...
 *     responses:
 *       200:
 *         description: Withdrawal request submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Insufficient balance or invalid amount
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/withdraw', authenticateToken, validateWithdrawal, requestWithdrawal);

/**
 * @swagger
 * /api/wallet/withdrawals:
 *   get:
 *     summary: Get user's withdrawal history
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's withdrawal history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id: { type: string, format: uuid }
 *                   amount: { type: number, format: decimal }
 *                   status: { type: string, example: pending }
 *                   requestDate: { type: string, format: date-time }
 *                   processedDate: { type: string, format: date-time, nullable: true }
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/withdrawals', authenticateToken, getWithdrawals);

export default router;