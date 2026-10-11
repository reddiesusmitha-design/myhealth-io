import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/response';
import { prisma, isPrismaConnected } from '../config/prisma';

export async function getTimeline(req: AuthenticatedRequest, res: Response) {
  const userId = req.user?.id;
  if (!userId) return sendError(res, 'Unauthorized', 401);

  try {
    if (isPrismaConnected()) {
      const events = await prisma.timelineEvent.findMany({
        where: { userId },
        orderBy: { eventDate: 'desc' },
      });
      return sendSuccess(res, events, 'Timeline events retrieved from Supabase PostgreSQL');
    }
  } catch (err: any) {
    return sendError(res, `Failed to load timeline: ${err.message}`, 500);
  }

  return sendSuccess(res, [], 'Timeline events retrieved');
}
