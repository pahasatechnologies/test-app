import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getAllNotifications,
  sendGlobalNotification
} from '../controllers/notificationController';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: User notification management
 */

// User routes (require authentication)
router.use(authenticateToken);

router.get('/', getUserNotifications);
router.get('/unread-count', getUnreadCount);
router.put('/:id/read', markAsRead);
router.put('/mark-all-read', markAllAsRead);
router.delete('/:id', deleteNotification);

// Admin routes
router.get('/admin/all', requireAdmin, getAllNotifications);
router.post('/admin/global', requireAdmin, sendGlobalNotification);

export default router;