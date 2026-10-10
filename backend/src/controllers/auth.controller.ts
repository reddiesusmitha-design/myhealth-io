import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendSuccess, sendError } from '../utils/response';
import { config } from '../config';
import { UserModel } from '../models/User';
import { NotificationModel } from '../models/Notification';
import { isDatabaseConnected, connectDatabase } from '../config/database';
import { AuthenticatedRequest } from '../middleware/auth';

// Resilient in-memory user registry for when DB_URL is awaiting real Atlas credentials
const memoryUsers = new Map<string, any>();

/**
 * Register a new user: Saves to MongoDB Atlas if connected, with resilient fallback
 */
export async function register(req: Request, res: Response) {
  const { email, password, fullName, preferredLanguage } = req.body;

  if (!email || !password || !fullName) {
    return sendError(res, 'Full name, email, and password are required', 400);
  }

  // Attempt database connection if not currently active
  let dbActive = isDatabaseConnected();
  if (!dbActive) {
    dbActive = await connectDatabase();
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    // 1. If MongoDB Atlas is connected, use real Mongoose model
    if (dbActive) {
      const existingUser = await UserModel.findOne({ email: normalizedEmail });
      if (existingUser) {
        return sendError(res, 'An account with this email address already exists. Please log in.', 400);
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const randomPart = () => Math.floor(1000 + Math.random() * 9000);
      const mockAbhaId = `ABHA-91-${randomPart()}-${randomPart()}-${randomPart()}`;

      const userDoc = await UserModel.create({
        email: normalizedEmail,
        passwordHash,
        fullName: fullName.trim(),
        mockAbhaId,
        preferredLanguage: preferredLanguage || 'en',
        bloodGroup: 'O+',
        allergies: [],
        chronicConditions: [],
      });

      try {
        await NotificationModel.create({
          userId: userDoc._id.toString(),
          title: 'Welcome to MyHealthIO!',
          message: `Account created for ${userDoc.fullName}. Your ABHA ID is ${mockAbhaId}.`,
          type: 'SYSTEM',
          priority: 'NORMAL',
          read: false,
        });
      } catch {
        // non-blocking
      }

      const token = jwt.sign(
        { id: userDoc._id.toString(), email: userDoc.email },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn as any }
      );

      const user = {
        id: userDoc._id.toString(),
        email: userDoc.email,
        fullName: userDoc.fullName,
        mockAbhaId: userDoc.mockAbhaId,
        preferredLanguage: userDoc.preferredLanguage,
        bloodGroup: userDoc.bloodGroup,
        emergencyContact: userDoc.emergencyContact || '',
      };

      // Also cache in memory map
      memoryUsers.set(normalizedEmail, { ...user, passwordHash });
      memoryUsers.set(user.id, { ...user, passwordHash });

      return sendSuccess(res, { token, user }, 'Account successfully created and saved in MongoDB Atlas', 201);
    }

    // 2. Resilient fallback mode (when DB_URL has <username>/<password> placeholders)
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

    return sendSuccess(
      res,
      { token, user },
      'Account created successfully! Note: Replace <username>:<password> in backend/.env with your MongoDB Atlas string to persist directly to Atlas.',
      201
    );
  } catch (error: any) {
    console.error('[Registration Error]:', error);
    return sendError(res, `Failed to register user: ${error.message}`, 500);
  }
}

/**
 * Authenticate existing user against MongoDB Atlas or fallback registry
 */
export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  if (!email || !password) {
    return sendError(res, 'Email and password are required', 400);
  }

  let dbActive = isDatabaseConnected();
  if (!dbActive) {
    dbActive = await connectDatabase();
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    // 1. Try MongoDB Atlas if connected
    if (dbActive) {
      const userDoc = await UserModel.findOne({ email: normalizedEmail });
      if (userDoc) {
        const isMatch = await bcrypt.compare(password, userDoc.passwordHash);
        if (!isMatch) {
          return sendError(res, 'Invalid email or password.', 401);
        }

        const token = jwt.sign(
          { id: userDoc._id.toString(), email: userDoc.email },
          config.jwtSecret,
          { expiresIn: config.jwtExpiresIn as any }
        );

        const user = {
          id: userDoc._id.toString(),
          email: userDoc.email,
          fullName: userDoc.fullName,
          mockAbhaId: userDoc.mockAbhaId,
          preferredLanguage: userDoc.preferredLanguage,
          bloodGroup: userDoc.bloodGroup,
          emergencyContact: userDoc.emergencyContact || '',
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
    if (isDatabaseConnected()) {
      const userDoc = await UserModel.findById(userId).select('-passwordHash');
      if (userDoc) {
        return sendSuccess(res, userDoc, 'User details retrieved');
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
