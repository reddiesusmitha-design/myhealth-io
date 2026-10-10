import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/response';
import { NotificationModel } from '../models/Notification';
import { isDatabaseConnected } from '../config/database';

// In-memory fallback notifications
let memoryNotifications: any[] = [];

export async function listNotifications(req: AuthenticatedRequest, res: Response) {
  const userId = req.user?.id || 'patient-user-001';

  try {
    if (isDatabaseConnected()) {
      const docs = await NotificationModel.find({ userId }).sort({ createdAt: -1 }).limit(50);
      return sendSuccess(res, docs, 'Notifications fetched successfully');
    }
  } catch (err) {
    // fallback to memory
  }

  const userNotifs = memoryNotifications.filter((n) => !n.userId || n.userId === userId);
  return sendSuccess(res, userNotifs, 'Notifications fetched successfully');
}

export async function markNotificationAsRead(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const userId = req.user?.id || 'patient-user-001';

  try {
    if (isDatabaseConnected()) {
      const updated = await NotificationModel.findOneAndUpdate(
        { _id: id, userId },
        { read: true },
        { new: true }
      );
      if (updated) return sendSuccess(res, updated, 'Notification marked as read');
    }
  } catch (err) {
    // fallback
  }

  const notif = memoryNotifications.find((n) => n.id === id || n._id === id);
  if (notif) {
    notif.read = true;
    return sendSuccess(res, notif, 'Notification marked as read');
  }

  return sendSuccess(res, { id, read: true }, 'Notification marked as read');
}

export async function markAllNotificationsRead(req: AuthenticatedRequest, res: Response) {
  const userId = req.user?.id || 'patient-user-001';

  try {
    if (isDatabaseConnected()) {
      await NotificationModel.updateMany({ userId }, { read: true });
    }
  } catch (err) {
    // fallback
  }

  memoryNotifications.forEach((n) => {
    if (!n.userId || n.userId === userId) n.read = true;
  });

  return sendSuccess(res, { success: true }, 'All notifications marked as read');
}

export async function createNotification(req: AuthenticatedRequest, res: Response) {
  const userId = req.user?.id || 'patient-user-001';
  const { title, message, type, priority, actionUrl } = req.body;

  if (!title || !message) {
    return sendError(res, 'Title and message are required', 400);
  }

  const newNotif = {
    id: `notif-${Date.now()}`,
    userId,
    title,
    message,
    type: type || 'SYSTEM',
    priority: priority || 'NORMAL',
    read: false,
    actionUrl: actionUrl || '',
    createdAt: new Date(),
  };

  try {
    if (isDatabaseConnected()) {
      const doc = await NotificationModel.create(newNotif);
      return sendSuccess(res, doc, 'Notification created', 201);
    }
  } catch (err) {
    // fallback
  }

  memoryNotifications.unshift(newNotif);
  return sendSuccess(res, newNotif, 'Notification created', 201);
}

export async function deleteNotification(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const userId = req.user?.id || 'patient-user-001';

  try {
    if (isDatabaseConnected()) {
      await NotificationModel.deleteOne({ _id: id, userId });
    }
  } catch (err) {
    // fallback
  }

  memoryNotifications = memoryNotifications.filter((n) => n.id !== id && n._id !== id);
  return sendSuccess(res, { id }, 'Notification deleted');
}
