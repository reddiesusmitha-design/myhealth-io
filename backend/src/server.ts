import app from './app';
import { config } from './config';
import { logger } from './utils/logger';
import { connectPrisma, disconnectPrisma } from './config/prisma';

const server = app.listen(config.port, async () => {
  logger.info(`MyHealthIO Backend running on port ${config.port} in ${config.nodeEnv} mode`);
  logger.info(`Configured Client URL: ${config.clientUrl}`);
  await connectPrisma();
});

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Shutting down gracefully.');
  await disconnectPrisma();
  server.close(() => {
    logger.info('Server process terminated.');
  });
});


