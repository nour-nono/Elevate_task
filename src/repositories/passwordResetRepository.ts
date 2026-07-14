import { BaseRepository } from './baseRepository';
import PasswordReset, { IPasswordReset } from '../models/passwordReset';
import { hashOtp, otpExpiryDate } from '../utils/otp';

class PasswordResetRepository extends BaseRepository<IPasswordReset> {
  constructor() {
    super(PasswordReset);
  }

  async upsertOtp(email: string, otp: string): Promise<IPasswordReset> {
    const otpHash = hashOtp(otp);
    return this.model
      .findOneAndUpdate(
        { email: email.toLowerCase().trim() },
        { otpHash, expiresAt: otpExpiryDate(), used: false, attempts: 0 },
        {
          returnDocument: 'after',
          upsert: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        },
      )
      .exec();
  }

  async findActiveByEmail(email: string): Promise<IPasswordReset | null> {
    return this.findOne({
      email: email.toLowerCase().trim(),
      used: false,
      expiresAt: { $gt: new Date() },
    });
  }

  async markUsed(id: string): Promise<void> {
    await this.updateById(id, { used: true });
  }

  async incrementAttempts(id: string): Promise<void> {
    await this.model
      .findByIdAndUpdate(id, { $inc: { attempts: 1 } } as never, {
        returnDocument: 'after',
      })
      .exec();
  }
}

const passwordResetRepository = new PasswordResetRepository();
export default passwordResetRepository;
