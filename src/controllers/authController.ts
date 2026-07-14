import path from 'path';
import { Request, Response, NextFunction } from 'express';
import asyncWrapper from '../middlewares/asyncWrapper';
import authService from '../services/authService';
import userService from '../services/userService';
import passwordService from '../services/passwordService';
import ApiError from '../utils/apiError';
import HttpStatus from '../utils/httpStatus';
import { PublicUser } from '../services/userService';

export const registerUser = asyncWrapper(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { email, password } = req.body;
    const user: PublicUser = await userService.register(email, password);

    res.status(HttpStatus.CREATED).json({
      success: true,
      message: 'User registered successfully',
      data: { user },
    });
  },
);

export const loginUser = asyncWrapper(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { email, password } = req.body;
    const result = await authService.login(email, password);

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  },
);

export const logoutUser = asyncWrapper(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { jti, userId, exp } = req.user!;
    await authService.logout(jti, userId, exp as number);

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Logout successful. Token has been revoked.',
    });
  },
);

export const uploadProfilePic = asyncWrapper(
  async (req: Request, res: Response, _next: NextFunction) => {
    if (!req.file) {
      throw ApiError.badRequest(
        'No image file uploaded. Use the "profilePic" field.',
      );
    }
    const filePath = path
      .relative(process.cwd(), req.file.path)
      .replace(/\\/g, '/');

    const updatedUser = await userService.updateProfilePic(
      req.user!.userId,
      filePath,
    );

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Profile picture uploaded successfully',
      data: {
        user: updatedUser,
        profilePicUrl: `/${filePath}`,
      },
    });
  },
);

export const forgetPassword = asyncWrapper(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { email } = req.body;
    await passwordService.forgotPassword(email);

    res.status(HttpStatus.OK).json({
      success: true,
      message:
        'If an account exists for that email, a password reset code has been sent.',
    });
  },
);

export const resetPassword = asyncWrapper(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { email, otp, newPassword } = req.body;
    await passwordService.resetPassword(email, otp, newPassword);

    res.status(HttpStatus.OK).json({
      success: true,
      message:
        'Password reset successfully. You can now log in with your new password.',
    });
  },
);

export const getProfile = asyncWrapper(
  async (req: Request, res: Response, _next: NextFunction) => {
    const user = await authService.getAuthenticatedUser(req.user!.userId);

    res.status(HttpStatus.OK).json({
      success: true,
      data: {
        id: (user._id as { toString(): string }).toString(),
        email: user.email,
        profilePic: user.profilePic || '',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  },
);
