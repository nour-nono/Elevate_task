import 'dotenv/config';
import { createApp } from './app';
import { connectDB, disconnectDB } from './config/db';
import env from './config/env';
import logger from './utils/logger';
import { getPublicKey } from './utils/jwt';

async function bootstrap(): Promise<void> {
  try {
    getPublicKey();

    await connectDB();
    const app = await createApp();

    const server = app.listen(env.port, () => {
      logger.info(`Server is running on port ${env.port}`);
      logger.info(`Environment: ${env.nodeEnv}`);
      logger.info(`GraphQL endpoint: http://localhost:${env.port}/graphql`);
      logger.info(`REST API base: http://localhost:${env.port}/api/v1`);
    });

    const shutdown = async (signal: string) => {
      logger.info(`${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        await disconnectDB();
        process.exit(0);
      });
      setTimeout(() => {
        logger.error('Forcing shutdown after timeout');
        process.exit(1);
      }, 10000).unref();
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    process.on('unhandledRejection', (reason) => {
      logger.error('Unhandled Rejection:', reason);
    });
    process.on('uncaughtException', (err) => {
      logger.error('Uncaught Exception:', err);
      process.exit(1);
    });
  } catch (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
}

bootstrap();
