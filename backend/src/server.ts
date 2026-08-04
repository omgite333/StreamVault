import app from './app';
import { env } from './config/env';
import { prisma } from './config/database';

const connectDB = async () => {
  try {
    await prisma.$connect();
    // eslint-disable-next-line no-console
    console.log('Database connected');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Database connection failed:', error instanceof Error ? error.message : error);
  }
};

const server = app.listen(env.PORT, async () => {
  // eslint-disable-next-line no-console
  console.log(`Server running in ${env.NODE_ENV} mode on http://localhost:${env.PORT}`);
  await connectDB();
});

const shutdown = (signal: string) => {
  // eslint-disable-next-line no-console
  console.log(`\n${signal} received. Shutting down gracefully...`);

  server.close(() => {
    // eslint-disable-next-line no-console
    console.log('Server closed.');
    process.exit(0);
  });

  setTimeout(() => process.exit(1), 10_000).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
