import nodemailer, { Transporter } from 'nodemailer';
import env from '../config/env';
import logger from '../utils/logger';

class EmailService {
  private transporter: Transporter | null = null;

  private async getTransport(): Promise<Transporter> {
    if (this.transporter) return this.transporter;

    if (!env.email.user || env.email.host === 'ethereal') {
      await this.createEtherealTransport();
      return this.transporter!;
    }

    this.transporter = nodemailer.createTransport({
      host: env.email.host,
      port: env.email.port,
      secure: env.email.port === 465,
      auth: { user: env.email.user, pass: env.email.pass },
    });

    return this.transporter;
  }

  private async createEtherealTransport(): Promise<void> {
    const testAccount = await nodemailer.createTestAccount();
    logger.info(
      `Ethereal email account created: ${testAccount.user} (preview emails at https://ethereal.email)`,
    );
    this.transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
  }

  async sendOtp(to: string, otp: string): Promise<void> {
    const transporter = await this.getTransport();
    const ttlMinutes = env.otp.ttlMinutes;

    const info = await transporter.sendMail({
      from: `"Elevate Task" <${env.email.from}>`,
      to,
      subject: 'Password Reset OTP',
      text: `Your password reset code is: ${otp}\n\nThis code expires in ${ttlMinutes} minutes. If you did not request a password reset, please ignore this email.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>Use the following one-time code to reset your password:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 6px;
                      background: #f4f4f4; padding: 16px; text-align: center;
                      border-radius: 8px; margin: 20px 0;">${otp}</div>
          <p>This code expires in <strong>${ttlMinutes} minutes</strong>.</p>
          <p style="color: #888; font-size: 12px;">
            If you did not request this reset, you can safely ignore this email.
          </p>
        </div>
      `,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      logger.info(`OTP email sent to ${to}. Preview: ${previewUrl}`);
    } else {
      logger.info(`OTP email sent to ${to}`);
    }
  }
}

const emailService = new EmailService();
export default emailService;
