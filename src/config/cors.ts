import { CorsOptions } from 'cors';
import env from './env';

const corsOptions: CorsOptions = {
  origin: function (origin, callback) {
    if (env.nodeEnv === 'development') {
      callback(null, true);
    } else {
      const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
        .split(',')
        .filter(Boolean);
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true, // Allow cookies/auth headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
  ],
  maxAge: 86400, // 24 hours - cache preflight responses
};

export default corsOptions;
