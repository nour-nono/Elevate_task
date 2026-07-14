import { BaseRepository } from './baseRepository';
import RevokedToken, { IRevokedToken } from '../models/revokedToken';
import { Types } from 'mongoose';

class RevokedTokenRepository extends BaseRepository<IRevokedToken> {
  constructor() {
    super(RevokedToken);
  }

  async revoke(
    jti: string,
    userId: string | Types.ObjectId,
    expiresAt: Date,
  ): Promise<void> {
    await this.create({
      jti,
      userId,
      expiresAt,
    } as Partial<IRevokedToken>);
  }

  async isRevoked(jti: string): Promise<boolean> {
    return this.exists({ jti });
  }
}

const revokedTokenRepository = new RevokedTokenRepository();
export default revokedTokenRepository;
