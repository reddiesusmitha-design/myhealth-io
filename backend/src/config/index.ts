import dotenv from 'dotenv';
dotenv.config();


const cleanEnv = (val?: string): string =>
  val ? val.replace(/[\r\n\t"]/g, '').trim() : '';

export const config = {
  port: parseInt(cleanEnv(process.env.PORT) || '5000', 10),
  nodeEnv: cleanEnv(process.env.NODE_ENV) || 'development',
  clientUrl: cleanEnv(process.env.CLIENT_URL) || 'http://localhost:5173',
  dbUrl: cleanEnv(process.env.DB_URL) || cleanEnv(process.env.DATABASE_URL) || '',
  databaseUrl: cleanEnv(process.env.DB_URL) || cleanEnv(process.env.DATABASE_URL) || '',
  jwtSecret: cleanEnv(process.env.JWT_SECRET) || 'dev_jwt_secret_key_change_in_production',
  jwtExpiresIn: cleanEnv(process.env.JWT_EXPIRES_IN) || '7d',
  uploadDir: cleanEnv(process.env.UPLOAD_DIR) || './uploads',
  maxFileSizeMb: parseInt(cleanEnv(process.env.MAX_FILE_SIZE_MB) || '10', 10),
  aiProvider: cleanEnv(process.env.AI_PROVIDER) || 'template',
  geminiApiKey: cleanEnv(process.env.GEMINI_API_KEY) || '',
  openaiApiKey: cleanEnv(process.env.OPENAI_API_KEY) || '',
};
