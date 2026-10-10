import app from './app';
import { config } from './config';
import { logger } from './utils/logger';
import { connectDatabase } from './config/database';

const server = app.listen(config.port, async () => {
  logger.info(`MyHealthIO Backend running on port ${config.port} in ${config.nodeEnv} mode`);
  logger.info(`Configured Client URL: ${config.clientUrl}`);
  await connectDatabase();
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully.');
  server.close(() => {
    logger.info('Server process terminated.');
  });
});
