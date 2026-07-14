import 'dotenv/config';
import express, { Application, json } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';

import corsOptions from './config/cors';
import env from './config/env';
import authRoutes from './routes/authRoutes';
import notesRoutes from './routes/notesRoutes';
import { notFoundHandler, errorHandler } from './middlewares/error';
import { typeDefs } from './graphql/schema';
import { resolvers } from './graphql/resolvers';
import { buildGraphqlContext, GqlContext } from './graphql/context';
import ApiError from './utils/apiError';

export async function createApp(): Promise<Application> {
  const app: Application = express();

  app.use(compression());
  app.use(json());
  app.use(express.urlencoded({ extended: true }));
  app.use(helmet());
  app.use(cors(corsOptions));

  const limiter = rateLimit({
    windowMs: env.rateLimit.windowMs,
    max: env.rateLimit.max,
    message: 'Too many requests, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(limiter);

  app.use(
    '/uploads',
    express.static(path.resolve(process.cwd(), env.uploadDir)),
  );

  app.get('/health', (_req, res) => {
    res.status(200).json({ success: true, message: 'Server is healthy' });
  });

  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/notes', notesRoutes);

  const apolloServer = new ApolloServer<GqlContext>({
    typeDefs,
    resolvers,
    introspection: env.nodeEnv !== 'production',
    formatError(formattedError, error) {
      const originalError = (error as { originalError?: unknown })
        .originalError;

      if (originalError instanceof ApiError) {
        return {
          message: originalError.message,
          extensions: {
            success: false,
            statusCode: originalError.statusCode,
            details: originalError.details,
          },
        };
      }

      return {
        message: formattedError.message,
        extensions: {
          success: false,
          statusCode: formattedError?.extensions?.code,
        },
      };
    },
  });
  await apolloServer.start();

  app.use(
    '/graphql',
    expressMiddleware(apolloServer, {
      context: async ({ req, res }) => buildGraphqlContext(req, res),
    }),
  );

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export default createApp;
