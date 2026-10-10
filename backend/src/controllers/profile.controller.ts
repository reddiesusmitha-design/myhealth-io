import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/response';
import { UserModel } from '../models/User';
import { isDatabaseConnected } from '../config/database';

export async function getProfile(req: AuthenticatedRequest, res: Response) {
  const userId = req.user?.id;
  if (!userId) return sendError(res, 'Unauthorized', 401);

  try {
    if (isDatabaseConnected()) {
      const userDoc = await UserModel.findById(userId).select('-passwordHash');
      if (userDoc) {
        return sendSuccess(res, userDoc, 'Profile retrieved from MongoDB');
      }
    }
  } catch (err: any) {
    return sendError(res, `Failed to fetch profile: ${err.message}`, 500);
  }

  return sendSuccess(res, { id: userId, email: req.user?.email }, 'Profile retrieved');
}

export async function updateProfile(req: AuthenticatedRequest, res: Response) {
  const userId = req.user?.id;
  if (!userId) return sendError(res, 'Unauthorized', 401);

  const { fullName, dateOfBirth, gender, bloodGroup, emergencyContact, preferredLanguage, allergies, chronicConditions } = req.body;

  try {
    if (isDatabaseConnected()) {
      const updated = await UserModel.findByIdAndUpdate(
        userId,
        {
          $set: {
            ...(fullName && { fullName: fullName.trim() }),
            ...(dateOfBirth && { dateOfBirth }),
            ...(gender && { gender }),
            ...(bloodGroup && { bloodGroup }),
            ...(emergencyContact !== undefined && { emergencyContact }),
            ...(preferredLanguage && { preferredLanguage }),
            ...(allergies && { allergies }),
            ...(chronicConditions && { chronicConditions }),
          },
        },
        { new: true }
      ).select('-passwordHash');

      if (updated) {
        return sendSuccess(res, updated, 'Profile updated in MongoDB Atlas');
      }
    }
  } catch (err: any) {
    return sendError(res, `Failed to update profile: ${err.message}`, 500);
  }

  return sendSuccess(res, req.body, 'Profile updated');
}
