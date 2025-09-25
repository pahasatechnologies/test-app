import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import {
  getAllTicketTypes,
  getTicketTypeById,
  createTicketType,
  updateTicketType,
  deleteTicketType,
  getTicketTypeStats
} from '../controllers/ticketTypeController';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: TicketTypes
 *   description: Ticket type management
 */

// Public routes
router.get('/', getAllTicketTypes);
router.get('/:id', getTicketTypeById);

// Admin routes
router.use(authenticateToken);
router.use(requireAdmin);

router.post('/', createTicketType);
router.put('/:id', updateTicketType);
router.delete('/:id', deleteTicketType);
router.get('/admin/stats', getTicketTypeStats);

export default router;