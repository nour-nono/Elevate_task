import { Request, Response } from 'express';
import tokenService from '../services/tokenService';
import { AuthenticatedUser } from '../types/express';

export interface GqlContext {
  user: AuthenticatedUser | null;
}

export async function buildGraphqlContext(
  req: Request,
  _res: Response,
): Promise<GqlContext> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { user: null };
  }

  const token = authHeader.slice('Bearer '.length).trim();
  try {
    const decoded = tokenService.verify(token);
    if (!decoded.jti) {
      return { user: null };
    }
    const isRevoked = await tokenService.isRevoked(decoded.jti);
    if (isRevoked) {
      return { user: null };
    }
    return {
      user: {
        userId: decoded.userId,
        email: decoded.email,
        jti: decoded.jti,
        iat: decoded.iat,
        exp: decoded.exp,
      },
    };
  } catch {
    return { user: null };
  }
}

export default buildGraphqlContext;
