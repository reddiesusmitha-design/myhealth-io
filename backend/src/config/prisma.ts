import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

declare global {
  // eslint-disable-next-line no-var
  var __prismaInstance: PrismaClient | undefined;
}

export const prisma =
  global.__prismaInstance ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.__prismaInstance = prisma;
}

let isConnected = false;

export async function connectPrisma(): Promise<boolean> {
  const dbUrl = (process.env.DATABASE_URL || '').trim();
  if (!dbUrl || dbUrl.includes('[PASSWORD]') || dbUrl.includes('<password>')) {
    logger.warn(
      '[Prisma PostgreSQL] Notice: DATABASE_URL is unconfigured or contains placeholder values. Set a valid Supabase PostgreSQL connection string in .env'
    );
    isConnected = false;
    return false;
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    isConnected = true;
    logger.info('[Prisma PostgreSQL] Successfully connected to PostgreSQL database!');
    return true;
  } catch (error: any) {
    isConnected = false;
    logger.warn(`[Prisma PostgreSQL] Connection attempt: ${error.message}`);
    return false;
  }
}

export function isPrismaConnected(): boolean {
  return isConnected;
}

export function getPrismaStatus(): { connected: boolean; provider: string } {
  return {
    connected: isConnected,
    provider: 'postgresql',
  };
}

export async function disconnectPrisma(): Promise<void> {
  try {
    await prisma.$disconnect();
    isConnected = false;
    logger.info('[Prisma PostgreSQL] Disconnected from database.');
  } catch (error: any) {
    logger.warn(`[Prisma PostgreSQL] Error disconnecting: ${error.message}`);
  }
}

