import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: (process.env.CLIENT_URL || 'https://myhealthio-frontend.onrender.com').toString().replace(/[\[\]"']/g, "").trim().split(",")[0],
  dbUrl: process.env.DB_URL || process.env.DATABASE_URL || '',
  databaseUrl: process.env.DB_URL || process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || 'dev_jwt_secret_key_change_in_production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10),
  aiProvider: process.env.AI_PROVIDER || 'gemini',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  openaiApiKey: process.env.OPENAI_API_KEY || '',
};
