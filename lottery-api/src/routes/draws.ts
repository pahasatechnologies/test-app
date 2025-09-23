import { Router } from 'express';
import { conductDraw, getDrawHistory } from '../controllers/drawController';
import { optionalAuth } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Draws
 *   description: Lottery draw operations
 */

/**
 * @swagger
 * /api/draws/conduct:
 *   post:
 *     summary: Conduct a new lottery draw
 *     tags: [Draws]
 *     security:
 *       - bearerAuth: []
 *     description: This endpoint is typically protected and only callable by an admin or a cron job to initiate a new lottery draw.
 *     responses:
 *       200:
 *         description: Lottery draw conducted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: Unauthorized (if protected)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden (if protected and not admin)
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
router.post('/conduct', conductDraw);

/**
 * @swagger
 * /api/draws/history:
 *   get:
 *     summary: Get lottery draw history
 *     tags: [Draws]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Limit the number of draws returned
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Offset for pagination
 *     responses:
 *       200:
 *         description: A list of past lottery draws
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Draw'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/history', optionalAuth, getDrawHistory);

export default router;