import { Request } from 'express';

export interface AuthenticatedUser {
  userId: string;
  email: string;
  jti: string;
  iat?: number;
  exp?: number;
}

/**
 * Module Augmentation:
 * We extend the Express Request interface
 * by adding a new property called `user`
 *
 * Purpose:
 * Let TypeScript know that `req.user` exists,
 * instead of throwing an error that it doesn't exist
 */
declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthenticatedUser;
  }
}
