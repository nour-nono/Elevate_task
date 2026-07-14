import { Request, Response, NextFunction } from 'express';
import ApiError from '../utils/apiError';

export default function requireUser(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  if (!req.user) {
    return next(ApiError.unauthorized('Authentication required'));
  }

  next();
}
