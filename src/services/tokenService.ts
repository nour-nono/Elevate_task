import crypto from 'crypto';
import { signAccessToken, verifyAccessToken, DecodedToken } from '../utils/jwt';
import revokedTokenRepository from '../repositories/revokedTokenRepository';
import env from '../config/env';

export interface TokenIssueResult {
  token: string;
  jti: string;
  expiresIn: number;
  expiresAt: Date;
}

class TokenService {
  private generateJti(): string {
    return crypto.randomUUID();
  }

  issueAccessToken(userId: string, email: string): TokenIssueResult {
    const jti = this.generateJti();
    const token = signAccessToken({ userId, email }, jti);
    const expiresAt = new Date(Date.now() + env.jwt.accessTokenTtl * 1000);
    return { token, jti, expiresIn: env.jwt.accessTokenTtl, expiresAt };
  }

  verify(token: string): DecodedToken {
    return verifyAccessToken(token);
  }

  async revoke(jti: string, userId: string, expiresAt: number | Date): Promise<void> {
    const expDate = expiresAt instanceof Date ? expiresAt : new Date(expiresAt * 1000);
    await revokedTokenRepository.revoke(jti, userId, expDate);
  }

  async isRevoked(jti: string): Promise<boolean> {
    return revokedTokenRepository.isRevoked(jti);
  }
}

const tokenService = new TokenService();
export default tokenService;
