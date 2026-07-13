import { Request, Response, NextFunction } from 'express';
import tokenService from '../services/tokenService';
import ApiError from '../utils/apiError';
import { AuthenticatedUser } from '../types/express';

function extractToken(req: Request): string {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw ApiError.unauthorized(
      'Authentication required. Provide a Bearer token.',
    );
  }
  return authHeader.split(' ')[1].trim();
}

export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const token = extractToken(req);

    const decoded = tokenService.verify(token);

    if (!decoded.jti) {
      throw ApiError.unauthorized('Invalid token: missing token identifier');
    }

    const isRevoked = await tokenService.isRevoked(decoded.jti);
    if (isRevoked) {
      throw ApiError.unauthorized(
        'Token has been revoked. Please log in again.',
      );
    }

    const user: AuthenticatedUser = {
      userId: decoded.userId,
      email: decoded.email,
      jti: decoded.jti,
      iat: decoded.iat,
      exp: decoded.exp,
    };

    req.user = user;
    next();
  } catch (err) {
    if (err instanceof ApiError) return next(err);
    next(ApiError.unauthorized('Invalid or expired token'));
  }
}

export default authenticate;
