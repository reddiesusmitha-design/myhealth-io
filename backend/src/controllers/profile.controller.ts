import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/response';
import { prisma, isPrismaConnected } from '../config/prisma';

export async function getProfile(req: AuthenticatedRequest, res: Response) {
  const userId = req.user?.id;
  if (!userId) return sendError(res, 'Unauthorized', 401);

  try {
    if (isPrismaConnected()) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          fullName: true,
          mockAbhaId: true,
          preferredLanguage: true,
          dateOfBirth: true,
          gender: true,
          bloodGroup: true,
          emergencyContact: true,
          allergies: true,
          chronicConditions: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      if (user) {
        return sendSuccess(res, user, 'Profile retrieved from Supabase PostgreSQL');
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
    if (isPrismaConnected()) {
      const updated = await prisma.user.update({
        where: { id: userId },
        data: {
          ...(fullName && { fullName: fullName.trim() }),
          ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
          ...(gender !== undefined && { gender }),
          ...(bloodGroup !== undefined && { bloodGroup }),
          ...(emergencyContact !== undefined && { emergencyContact }),
          ...(preferredLanguage !== undefined && { preferredLanguage }),
          ...(allergies !== undefined && { allergies }),
          ...(chronicConditions !== undefined && { chronicConditions }),
        },
        select: {
          id: true,
          email: true,
          fullName: true,
          mockAbhaId: true,
          preferredLanguage: true,
          dateOfBirth: true,
          gender: true,
          bloodGroup: true,
          emergencyContact: true,
          allergies: true,
          chronicConditions: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (updated) {
        return sendSuccess(res, updated, 'Profile updated in Supabase PostgreSQL');
      }
    }
  } catch (err: any) {
    return sendError(res, `Failed to update profile: ${err.message}`, 500);
  }

  return sendSuccess(res, req.body, 'Profile updated');
}
