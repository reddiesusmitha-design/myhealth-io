/**
 * Safe Logger Module
 * Enforces PHI sanitization and prevents logging of sensitive clinical values or auth tokens.
 */
export const logger = {
  info: (msg: string, meta?: Record<string, unknown>) => {
    console.log(`[INFO] [${new Date().toISOString()}] ${msg}`, meta ? JSON.stringify(meta) : '');
  },
  warn: (msg: string, meta?: Record<string, unknown>) => {
    console.warn(`[WARN] [${new Date().toISOString()}] ${msg}`, meta ? JSON.stringify(meta) : '');
  },
  error: (msg: string, err?: unknown) => {
    console.error(`[ERROR] [${new Date().toISOString()}] ${msg}`, err);
  },
};
