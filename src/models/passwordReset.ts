import { Schema, model, Document, Model } from 'mongoose';

export interface IPasswordReset extends Document {
  email: string;
  otpHash: string;
  expiresAt: Date;
  used: boolean;
  attempts: number;
  createdAt: Date;
  updatedAt: Date;
}

interface IPasswordResetModel extends Model<IPasswordReset> {}

const passwordResetSchema = new Schema<IPasswordReset, IPasswordResetModel>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    otpHash: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    used: {
      type: Boolean,
      default: false,
    },
    attempts: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

passwordResetSchema.index({ email: 1, used: 1 });
passwordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const PasswordReset = model<IPasswordReset, IPasswordResetModel>(
  'PasswordReset',
  passwordResetSchema,
);

export default PasswordReset;
