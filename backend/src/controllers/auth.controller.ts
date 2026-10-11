import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendSuccess, sendError } from '../utils/response';
import { config } from '../config';
import { prisma, isPrismaConnected, connectPrisma } from '../config/prisma';
import { AuthenticatedRequest } from '../middleware/auth';

// In-memory fallback registry if database is temporarily connecting
const memoryUsers = new Map<string, any>();

/**
 * Register a new user: Saves directly to Supabase PostgreSQL via Prisma
 */
export async function register(req: Request, res: Response) {
  const { email, password, fullName, preferredLanguage } = req.body;

  if (!email || !password || !fullName) {
    return sendError(res, 'Full name, email, and password are required', 400);
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    // Ensure connection is active
    let isConnected = isPrismaConnected();
    if (!isConnected) {
      isConnected = await connectPrisma();
    }

    if (isConnected) {
      const existingUser = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (existingUser) {
        return sendError(res, 'An account with this email address already exists. Please log in.', 400);
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const randomPart = () => Math.floor(1000 + Math.random() * 9000);
      const mockAbhaId = `ABHA-91-${randomPart()}-${randomPart()}-${randomPart()}`;

      const userRecord = await prisma.user.create({
        data: {
          email: normalizedEmail,
          passwordHash,
          fullName: fullName.trim(),
          mockAbhaId,
          preferredLanguage: preferredLanguage || 'en',
          bloodGroup: 'O+',
          emergencyContact: '',
          allergies: [],
          chronicConditions: [],
        },
      });

      try {
        await prisma.notification.create({
          data: {
            userId: userRecord.id,
            title: 'Welcome to MyHealthIO!',
            message: `Account created for ${userRecord.fullName}. Your ABHA ID is ${mockAbhaId}.`,
            type: 'SYSTEM',
            priority: 'NORMAL',
            read: false,
          },
        });
      } catch {
        // non-blocking
      }

      const token = jwt.sign(
        { id: userRecord.id, email: userRecord.email },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn as any }
      );

      const user = {
        id: userRecord.id,
        email: userRecord.email,
        fullName: userRecord.fullName,
        mockAbhaId: userRecord.mockAbhaId,
        preferredLanguage: userRecord.preferredLanguage,
        bloodGroup: userRecord.bloodGroup,
        emergencyContact: userRecord.emergencyContact || '',
      };

      // Cache in memory fallback
      memoryUsers.set(normalizedEmail, { ...user, passwordHash });
      memoryUsers.set(user.id, { ...user, passwordHash });

      return sendSuccess(res, { token, user }, 'Account successfully created and saved in Supabase PostgreSQL', 201);
    }

    // Resilient fallback when database is not yet connected
    if (memoryUsers.has(normalizedEmail)) {
      return sendError(res, 'An account with this email address already exists. Please log in.', 400);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const randomPart = () => Math.floor(1000 + Math.random() * 9000);
    const mockAbhaId = `ABHA-91-${randomPart()}-${randomPart()}-${randomPart()}`;
    const generatedId = `usr-${Date.now()}`;

    const user = {
      id: generatedId,
      email: normalizedEmail,
      fullName: fullName.trim(),
      mockAbhaId,
      preferredLanguage: preferredLanguage || 'en',
      bloodGroup: 'O+',
      emergencyContact: '',
      allergies: [],
      chronicConditions: [],
      createdAt: new Date(),
    };

    memoryUsers.set(normalizedEmail, { ...user, passwordHash });
    memoryUsers.set(generatedId, { ...user, passwordHash });

    const token = jwt.sign(
      { id: user.id, email: user.email },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn as any }
    );

    return sendSuccess(res, { token, user }, 'Account created successfully in memory registry', 201);
  } catch (error: any) {
    console.error('[Registration Error]:', error);
    return sendError(res, `Failed to register user: ${error.message}`, 500);
  }
}

/**
 * Authenticate existing user against Supabase PostgreSQL
 */
export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  if (!email || !password) {
    return sendError(res, 'Email and password are required', 400);
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    let isConnected = isPrismaConnected();
    if (!isConnected) {
      isConnected = await connectPrisma();
    }

    // 1. Try Supabase PostgreSQL via Prisma
    if (isConnected) {
      const userRecord = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (userRecord) {
        const isMatch = await bcrypt.compare(password, userRecord.passwordHash);
        if (!isMatch) {
          return sendError(res, 'Invalid email or password.', 401);
        }

        const token = jwt.sign(
          { id: userRecord.id, email: userRecord.email },
          config.jwtSecret,
          { expiresIn: config.jwtExpiresIn as any }
        );

        const user = {
          id: userRecord.id,
          email: userRecord.email,
          fullName: userRecord.fullName,
          mockAbhaId: userRecord.mockAbhaId,
          preferredLanguage: userRecord.preferredLanguage,
          bloodGroup: userRecord.bloodGroup,
          emergencyContact: userRecord.emergencyContact || '',
        };

        return sendSuccess(res, { token, user }, 'Login successful');
      }
    }

    // 2. Check memory registry fallback
    const cachedUser = memoryUsers.get(normalizedEmail);
    if (cachedUser) {
      const isMatch = await bcrypt.compare(password, cachedUser.passwordHash);
      if (!isMatch) {
        return sendError(res, 'Invalid email or password.', 401);
      }

      const token = jwt.sign(
        { id: cachedUser.id, email: cachedUser.email },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn as any }
      );

      const { passwordHash, ...cleanUser } = cachedUser;
      return sendSuccess(res, { token, user: cleanUser }, 'Login successful');
    }

    return sendError(res, 'Invalid email or password. Please check credentials or register.', 401);
  } catch (error: any) {
    console.error('[Login Error]:', error);
    return sendError(res, `Login failed: ${error.message}`, 500);
  }
}

/**
 * Retrieve current user profile
 */
export async function getMe(req: AuthenticatedRequest, res: Response) {
  const userId = req.user?.id;
  if (!userId) {
    return sendError(res, 'Unauthorized', 401);
  }

  try {
    if (isPrismaConnected()) {
      const userRecord = await prisma.user.findUnique({
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

      if (userRecord) {
        return sendSuccess(res, userRecord, 'User details retrieved');
      }
    }

    const cached = memoryUsers.get(userId);
    if (cached) {
      const { passwordHash, ...cleanUser } = cached;
      return sendSuccess(res, cleanUser, 'User details retrieved');
    }

    return sendSuccess(res, { id: userId, email: req.user?.email }, 'User details retrieved');
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

export async function logout(req: Request, res: Response) {
  return sendSuccess(res, null, 'Logged out successfully');
}
