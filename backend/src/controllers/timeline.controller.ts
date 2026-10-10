import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/response';
import { TimelineModel } from '../models/Timeline';
import { isDatabaseConnected } from '../config/database';

export async function getTimeline(req: AuthenticatedRequest, res: Response) {
  const userId = req.user?.id;
  if (!userId) return sendError(res, 'Unauthorized', 401);

  try {
    if (isDatabaseConnected()) {
      const events = await TimelineModel.find({ userId }).sort({ eventDate: -1 });
      return sendSuccess(res, events, 'Timeline events retrieved from MongoDB Atlas');
    }
  } catch (err: any) {
    return sendError(res, `Failed to load timeline: ${err.message}`, 500);
  }

  return sendSuccess(res, [], 'Timeline events retrieved');
}
