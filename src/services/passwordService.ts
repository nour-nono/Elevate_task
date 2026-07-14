import passwordResetRepository from '../repositories/passwordResetRepository';
import userRepository from '../repositories/userRepository';
import userService from './userService';
import emailService from './emailService';
import { generateOtp, hashOtp, isOtpExpired } from '../utils/otp';
import ApiError from '../utils/apiError';
import logger from '../utils/logger';

const MAX_OTP_ATTEMPTS = 5;

class PasswordService {
  async forgotPassword(email: string): Promise<void> {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await userRepository.findByEmail(normalizedEmail);

    if (user) {
      const otp = generateOtp();
      await passwordResetRepository.upsertOtp(normalizedEmail, otp);

      try {
        await emailService.sendOtp(normalizedEmail, otp);
        logger.info(`Password reset OTP issued for ${normalizedEmail}`);
      } catch (err) {
        logger.error(`Failed to send OTP email to ${normalizedEmail}`, err);
      }
    } else {
      logger.warn(
        `Password reset requested for unknown email: ${normalizedEmail}`,
      );
    }
  }

  async resetPassword(
    email: string,
    otp: string,
    newPassword: string,
  ): Promise<void> {
    const normalizedEmail = email.toLowerCase().trim();
    const resetRecord =
      await passwordResetRepository.findActiveByEmail(normalizedEmail);

    if (!resetRecord) {
      throw ApiError.badRequest(
        'Invalid or expired OTP. Please request a new one.',
      );
    }

    if (resetRecord.attempts >= MAX_OTP_ATTEMPTS) {
      await passwordResetRepository.markUsed(
        (resetRecord._id as { toString(): string }).toString(),
      );
      throw ApiError.tooManyRequests(
        'Maximum OTP attempts exceeded. Please request a new one.',
      );
    }

    const submittedHash = hashOtp(otp);
    if (submittedHash !== resetRecord.otpHash) {
      await passwordResetRepository.incrementAttempts(
        (resetRecord._id as { toString(): string }).toString(),
      );
      throw ApiError.badRequest('Invalid OTP. Please try again.');
    }

    if (isOtpExpired(resetRecord.expiresAt)) {
      throw ApiError.badRequest('OTP has expired. Please request a new one.');
    }

    const user = await userRepository.findByEmail(normalizedEmail);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    await userService.updatePassword(user, newPassword);

    await passwordResetRepository.markUsed(
      (resetRecord._id as { toString(): string }).toString(),
    );

    logger.info(`Password reset successfully for ${normalizedEmail}`);
  }
}

const passwordService = new PasswordService();
export default passwordService;
