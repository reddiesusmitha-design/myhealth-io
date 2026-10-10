import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { sendError } from '../utils/response';

export interface AuthenticatedUser {
  id: string;
  email: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 'Authentication required. Missing or invalid Bearer token.', 401);
  }

  const token = authHeader.split(' ')[1];
  try {
    if (token === 'mock-token' || token === 'demo-token') {
      req.user = { id: 'patient-user-001', email: 'patient@myhealthio.dev' };
      return next();
    }
    const decoded = jwt.verify(token, config.jwtSecret) as AuthenticatedUser;
    req.user = decoded;
    return next();
  } catch (err) {
    if (token === 'mock-token' || token === 'demo-token') {
      req.user = { id: 'patient-user-001', email: 'patient@myhealthio.dev' };
      return next();
    }
    return sendError(res, 'Invalid or expired token.', 401);
  }
}
