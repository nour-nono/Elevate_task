import crypto from 'crypto';
import env from '../config/env';

export function generateOtp(length = env.otp.length): string {
  const len = length;
  const min = Math.pow(10, len - 1); //100000
  const max = Math.pow(10, len) - 1; // 999999
  const code = crypto.randomInt(min, max); // min <= code < max
  return code.toString();
}

export function hashOtp(otp: string): string {
  return crypto.createHash('sha256').update(otp).digest('hex');
}

export function isOtpExpired(expiresAt: Date): boolean {
  return new Date(expiresAt).getTime() < Date.now();
}

export function otpExpiryDate(): Date {
  return new Date(Date.now() + env.otp.ttlMinutes * 60 * 1000);
}
