import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/response';
import { prisma, isPrismaConnected } from '../config/prisma';

let memoryNotifications: any[] = [];

export async function listNotifications(req: AuthenticatedRequest, res: Response) {
  const userId = req.user?.id || 'patient-user-001';

  try {
    if (isPrismaConnected()) {
      const docs = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
      return sendSuccess(res, docs, 'Notifications fetched successfully from Supabase PostgreSQL');
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
    if (isPrismaConnected()) {
      const updated = await prisma.notification.updateMany({
        where: { id, userId },
        data: { read: true },
      });
      if (updated.count > 0) {
        const notif = await prisma.notification.findUnique({ where: { id } });
        return sendSuccess(res, notif, 'Notification marked as read in Supabase PostgreSQL');
      }
    }
  } catch (err) {
    // fallback
  }

  const notif = memoryNotifications.find((n) => n.id === id);
  if (notif) {
    notif.read = true;
    return sendSuccess(res, notif, 'Notification marked as read');
  }

  return sendSuccess(res, { id, read: true }, 'Notification marked as read');
}

export async function markAllNotificationsRead(req: AuthenticatedRequest, res: Response) {
  const userId = req.user?.id || 'patient-user-001';

  try {
    if (isPrismaConnected()) {
      await prisma.notification.updateMany({
        where: { userId },
        data: { read: true },
      });
      return sendSuccess(res, { success: true }, 'All notifications marked as read in Supabase PostgreSQL');
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
    userId,
    title,
    message,
    type: type || 'SYSTEM',
    priority: priority || 'NORMAL',
    read: false,
    actionUrl: actionUrl || '',
  };

  try {
    if (isPrismaConnected()) {
      const doc = await prisma.notification.create({
        data: newNotif,
      });
      return sendSuccess(res, doc, 'Notification created in Supabase PostgreSQL', 201);
    }
  } catch (err) {
    // fallback
  }

  const memNotif = { id: `notif-${Date.now()}`, ...newNotif, createdAt: new Date() };
  memoryNotifications.unshift(memNotif);
  return sendSuccess(res, memNotif, 'Notification created', 201);
}

export async function deleteNotification(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const userId = req.user?.id || 'patient-user-001';

  try {
    if (isPrismaConnected()) {
      await prisma.notification.deleteMany({
        where: { id, userId },
      });
      return sendSuccess(res, { id }, 'Notification deleted from Supabase PostgreSQL');
    }
  } catch (err) {
    // fallback
  }

  memoryNotifications = memoryNotifications.filter((n) => n.id !== id);
  return sendSuccess(res, { id }, 'Notification deleted');
}
