import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import {
  getDashboardStats,
  getAllUsers,
  getAllDraws,
  getPendingWithdrawals,
  processWithdrawal,
  getSystemConfig,
  createAdminUser,
  getSystemConfigs,
  updateSystemConfig,
  getConfigByKey,
  initializeDefaultConfigs,
} from '../controllers/adminController';
import { conductDraw } from '../controllers/drawController';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Administrative operations
 */

/**
 * @swagger
 * /api/admin/dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalUsers: { type: integer, example: 100 }
 *                 activeDraws: { type: integer, example: 5 }
 *                 totalTicketsSold: { type: integer, example: 1500 }
 *                 pendingWithdrawals: { type: number, format: decimal, example: 250.75 }
 *       401:
 *         description: Unauthorized, authentication token is missing or invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden, only administrators can access this resource
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
router.get('/dashboard/stats', getDashboardStats);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden, only administrators can access this resource
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
// User Management
router.get('/users', getAllUsers);

/**
 * @swagger
 * /api/admin/draws:
 *   get:
 *     summary: Get all lottery draws (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of lottery draws
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Draw'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden, only administrators can access this resource
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
// Draw Management
router.get('/draws', getAllDraws);
router.post('/draws/conduct', conductDraw);

/**
 * @swagger
 * /api/admin/draws/conduct:
 *   post:
 *     summary: Conduct a new lottery draw (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lottery draw conducted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden, only administrators can conduct draws
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

/**
 * @swagger
 * /api/admin/withdrawals/pending:
 *   get:
 *     summary: Get all pending withdrawals (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of pending withdrawals
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id: { type: string, format: uuid }
 *                   userId: { type: string, format: uuid }
 *                   amount: { type: number, format: decimal }
 *                   status: { type: string, example: pending }
 *                   requestDate: { type: string, format: date-time }
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden, only administrators can access this resource
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
// Withdrawal Management
router.get('/withdrawals/pending', getPendingWithdrawals);
router.post('/withdrawals/process', processWithdrawal);

/**
 * @swagger
 * /api/admin/withdrawals/process:
 *   post:
 *     summary: Process a user withdrawal (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - withdrawalId
 *               - status
 *             properties:
 *               withdrawalId:
 *                 type: string
 *                 format: uuid
 *                 example: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
 *               status:
 *                 type: string
 *                 enum: [approved, rejected]
 *                 example: approved
 *     responses:
 *       200:
 *         description: Withdrawal processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Invalid input or withdrawal ID
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
 *       403:
 *         description: Forbidden, only administrators can process withdrawals
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

/**
 * @swagger
 * /api/admin/config:
 *   get:
 *     summary: Get system configuration (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System configuration retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 minDeposit: { type: number, example: 10 }
 *                 maxWithdrawal: { type: number, example: 1000 }
 *                 ticketPrice: { type: number, example: 5 }
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden, only administrators can access this resource
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
// System Configuration
router.get('/config', getSystemConfig);

/**
 * @swagger
 * /api/admin/config/all:
 *   get:
 *     summary: Get all system configurations (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter configurations by category
 *     responses:
 *       200:
 *         description: A list of all system configurations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 configs:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SystemConfig'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden, only administrators can access this resource
 *       500:
 *         description: Server error
 */
router.get('/config/all', getSystemConfigs);

/**
 * @swagger
 * /api/admin/config/key/{key}:
 *   get:
 *     summary: Get a system configuration by key (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         description: The configuration key
 *     responses:
 *       200:
 *         description: System configuration value retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 key: { type: string, example: TICKET_PRICE }
 *                 value: { type: string, example: 5 }
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden, only administrators can access this resource
 *       404:
 *         description: Configuration not found
 *       500:
 *         description: Server error
 */
router.get('/config/key/:key', getConfigByKey);

/**
 * @swagger
 * /api/admin/config/key/{key}:
 *   put:
 *     summary: Update a system configuration by key (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         description: The configuration key to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ConfigUpdate'
 *     responses:
 *       200:
 *         description: Configuration updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: 'Configuration updated successfully' }
 *                 config:
 *                   $ref: '#/components/schemas/SystemConfig'
 *       400:
 *         description: Invalid input or configuration not editable
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden, only administrators can update configurations
 *       404:
 *         description: Configuration key not found
 *       500:
 *         description: Server error
 */
router.put('/config/key/:key', updateSystemConfig);

/**
 * @swagger
 * /api/admin/config/initialize:
 *   post:
 *     summary: Initialize default system configurations (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Default configurations initialized successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden, only administrators can initialize configurations
 *       500:
 *         description: Server error
 */
router.post('/config/initialize', initializeDefaultConfigs);

/**
 * @swagger
 * /api/admin/users/create-admin:
 *   post:
 *     summary: Create a new admin user (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - email
 *               - username
 *               - password
 *               - location
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: Admin User
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@example.com
 *               username:
 *                 type: string
 *                 example: adminuser
 *               password:
 *                 type: string
 *                 format: password
 *                 example: adminpassword
 *               location:
 *                 type: string
 *                 example: Admin City
 *     responses:
 *       201:
 *         description: Admin user created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Bad request (e.g., email already exists, invalid input)
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
 *       403:
 *         description: Forbidden, only administrators can create new admin users
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
// Admin User Management
router.post('/users/create-admin', createAdminUser);

export default router;