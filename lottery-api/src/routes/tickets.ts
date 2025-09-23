import { Router } from 'express';
import { getTicketInfo, purchaseTicket, getUserTickets } from '../controllers/ticketController';
import { authenticateToken, optionalAuth } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Tickets
 *   description: Ticket purchase and management
 */

/**
 * @swagger
 * /api/tickets/info:
 *   get:
 *     summary: Get lottery ticket information
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Ticket information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 currentTicketPrice: { type: number, format: decimal, example: 5.00 }
 *                 ticketsAvailable: { type: integer, example: 1000 }
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/info', optionalAuth, getTicketInfo);

/**
 * @swagger
 * /api/tickets/purchase:
 *   post:
 *     summary: Purchase a lottery ticket
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 example: 1
 *     responses:
 *       200:
 *         description: Ticket(s) purchased successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Invalid quantity or insufficient balance
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
router.post('/purchase', authenticateToken, purchaseTicket);

/**
 * @swagger
 * /api/tickets/my-tickets:
 *   get:
 *     summary: Get all tickets purchased by the authenticated user
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of user's tickets
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Ticket'
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
router.get('/my-tickets', authenticateToken, getUserTickets);

export default router;