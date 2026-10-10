import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  listNotifications,
  markNotificationAsRead,
  markAllNotificationsRead,
  createNotification,
  deleteNotification,
} from '../controllers/notifications.controller';

const router = Router();

router.use(authenticate);

router.get('/', listNotifications);
router.post('/', createNotification);
router.patch('/mark-all-read', markAllNotificationsRead);
router.patch('/:id/read', markNotificationAsRead);
router.delete('/:id', deleteNotification);

export default router;
