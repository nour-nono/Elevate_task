import { Schema, model, Document, Model, Types } from 'mongoose';
import bcrypt from 'bcrypt';

const BCRYPT_SALT_ROUNDS = 10;

export interface IUser extends Document<Types.ObjectId> {
  email: string;
  password: string;
  profilePic?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

interface IUserModel extends Model<IUser> {
  findByEmail(email: string): Promise<IUser | null>;
}

const userSchema = new Schema<IUser, IUserModel>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    profilePic: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        const r = ret as Record<string, unknown>;
        delete r.password;
        delete r.__v;
        r.id = r._id;
        return r;
      },
    },
  },
);

userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(BCRYPT_SALT_ROUNDS);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = function comparePassword(
  this: IUser,
  candidate: string,
): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

userSchema.statics.findByEmail = function findByEmail(
  this: IUserModel,
  email: string,
): Promise<IUser | null> {
  return this.findOne({ email: email.toLowerCase().trim() })
    .select('+password')
    .exec();
};

const User = model<IUser, IUserModel>('User', userSchema);

export default User;
