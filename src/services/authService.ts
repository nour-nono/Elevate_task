import tokenService from './tokenService';
import userService from './userService';
import ApiError from '../utils/apiError';
import logger from '../utils/logger';
import { IUser } from '../models/user';

export interface LoginResult {
  user: { id: string; email: string; profilePic: string };
  accessToken: string;
  tokenType: string;
  expiresIn: number;
}

class AuthService {
  async login(email: string, password: string): Promise<LoginResult> {
    const user = await userService.findByCredentials(email);
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const userId = (user._id as { toString(): string }).toString();
    const { token, expiresIn } = tokenService.issueAccessToken(
      userId,
      user.email,
    );

    logger.info(`User logged in: ${user.email}`);
    return {
      user: {
        id: userId,
        email: user.email,
        profilePic: user.profilePic || '',
      },
      accessToken: token,
      tokenType: 'Bearer',
      expiresIn,
    };
  }

  async logout(jti: string, userId: string, exp: number): Promise<void> {
    await tokenService.revoke(jti, userId, exp);
    logger.info(`Token revoked for user ${userId} (jti: ${jti})`);
  }

  async getAuthenticatedUser(userId: string): Promise<IUser> {
    const user = await userService.getById(userId);
    if (!user) {
      throw ApiError.unauthorized('User no longer exists');
    }
    return user;
  }
}

const authService = new AuthService();
export default authService;
