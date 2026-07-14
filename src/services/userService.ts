import { IUser } from '../models/user';
import userRepository from '../repositories/userRepository';
import noteRepository from '../repositories/noteRepository';
import ApiError from '../utils/apiError';
import logger from '../utils/logger';

export interface PublicUser {
  id: string;
  email: string;
  profilePic: string;
  createdAt: Date;
  updatedAt: Date;
}

class UserService {
  private toPublicUser(user: IUser): PublicUser {
    return {
      id: (user._id as { toString(): string }).toString(),
      email: user.email,
      profilePic: user.profilePic || '',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async register(email: string, password: string): Promise<PublicUser> {
    const normalizedEmail = email.toLowerCase().trim();
    const exists = await userRepository.emailExists(normalizedEmail);
    if (exists) {
      throw ApiError.conflict('A user with this email already exists');
    }

    const user = await userRepository.create({
      email: normalizedEmail,
      password,
    } as Partial<IUser>);

    logger.info(`User registered: ${normalizedEmail}`);
    return this.toPublicUser(user);
  }

  async getById(userId: string): Promise<IUser | null> {
    return userRepository.findById(userId);
  }

  async findByCredentials(email: string): Promise<IUser | null> {
    return userRepository.findByEmail(email);
  }

  async updateProfilePic(
    userId: string,
    filePath: string,
  ): Promise<PublicUser> {
    const updated = await userRepository.updateProfilePic(userId, filePath);
    if (!updated) {
      throw ApiError.notFound('User not found');
    }
    return this.toPublicUser(updated);
  }

  async updatePassword(user: IUser, newPassword: string): Promise<void> {
    user.password = newPassword;
    await user.save();
  }

  async deleteAccount(userId: string): Promise<void> {
    await userRepository.deleteById(userId);
    await noteRepository.deleteMany({ userId });
    logger.info(`User account deleted: ${userId}`);
  }
}

const userService = new UserService();
export default userService;
