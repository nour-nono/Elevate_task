import { CorsOptions } from 'cors';
import 'dotenv/config';

const corsOptions: CorsOptions = {
  origin: function (origin, callback) {
    // Allow requests from any origin in development
    if (process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      // In production, specify allowed origins
      const allowedOrigins = process.env!.ALLOWED_ORIGINS!.split(',') || [];

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
