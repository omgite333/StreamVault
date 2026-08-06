import app from './app';
import { env } from './config/env';
import { prisma } from './config/database';
import { logger } from './config/logger';

const connectDB = async () => {
  try {
    await prisma.$connect();
    logger.info('Database connected');
  } catch (error) {
    logger.error(error, 'Database connection failed');
  }
};

const server = app.listen(env.PORT, async () => {
  logger.info(`Server running in ${env.NODE_ENV} mode on http://localhost:${env.PORT}`);
  await connectDB();
});

const shutdown = (signal: string) => {
  logger.info(`${signal} received. Shutting down gracefully...`);

  server.close(() => {
    logger.info('Server closed.');
    process.exit(0);
  });

  setTimeout(() => {
    logger.error('Graceful shutdown timed out. Forcing exit.');
    process.exit(1);
  }, 10_000).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
