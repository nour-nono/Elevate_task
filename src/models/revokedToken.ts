import { Schema, model, Document, Model, Types } from 'mongoose';

export interface IRevokedToken extends Document<Types.ObjectId> {
  jti: string;
  userId: Types.ObjectId;
  expiresAt: Date;
  createdAt: Date;
}

interface IRevokedTokenModel extends Model<IRevokedToken> {}

const revokedTokenSchema = new Schema<IRevokedToken, IRevokedTokenModel>(
  {
    jti: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

revokedTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const RevokedToken = model<IRevokedToken, IRevokedTokenModel>(
  'RevokedToken',
  revokedTokenSchema,
);

export default RevokedToken;
