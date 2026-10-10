import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { config } from './index';
import { logger } from '../utils/logger';

let isConnected = false;

export async function connectDatabase(): Promise<boolean> {
  // Dynamically re-read .env in case the user recently updated DB_URL
  try {
    dotenv.config({ path: path.resolve(process.cwd(), '.env'), override: true });
  } catch {
    // ignore
  }

  let url = (process.env.DB_URL || process.env.DATABASE_URL || config.dbUrl || '').trim();

  // Strip wrapping quotes if any
  if ((url.startsWith('"') && url.endsWith('"')) || (url.startsWith("'") && url.endsWith("'"))) {
    url = url.slice(1, -1).trim();
  }

  if (!url || url.includes('<username>') || url.includes('<password>')) {
    logger.warn(
      '[MongoDB Atlas] Notice: DB_URL contains unconfigured placeholders (<username>/<password>). The app will operate in resilient mode until a valid MongoDB Atlas connection string is provided in backend/.env'
    );
    return false;
  }

  try {
    if (mongoose.connection.readyState === 1) {
      isConnected = true;
      return true;
    }

    mongoose.set('strictQuery', false);
    await mongoose.connect(url, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    logger.info('[MongoDB Atlas] Successfully connected to MongoDB Atlas database!');
    return true;
  } catch (error: any) {
    logger.error(`[MongoDB Atlas] Connection attempt failed: ${error.message}`);
    isConnected = false;
    return false;
  }
}

mongoose.connection.on('connected', () => {
  isConnected = true;
  logger.info('[MongoDB Atlas] Connection established.');
});

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  logger.warn('[MongoDB Atlas] Connection disconnected.');
});

mongoose.connection.on('error', (err) => {
  logger.error(`[MongoDB Atlas] Runtime error: ${err.message}`);
});

export function isDatabaseConnected(): boolean {
  return isConnected && mongoose.connection.readyState === 1;
}

export function getDatabaseStatus(): { connected: boolean; host?: string; name?: string } {
  return {
    connected: isDatabaseConnected(),
    host: isDatabaseConnected() ? mongoose.connection.host : 'local/unconnected',
    name: isDatabaseConnected() ? mongoose.connection.name : 'myhealthio',
  };
}
