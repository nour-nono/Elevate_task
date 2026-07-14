import express from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
  uploadProfilePic,
  forgetPassword,
  resetPassword,
  getProfile,
} from '../controllers/authController';
import authenticate from '../middlewares/auth';
import validate from '../middlewares/validate';
import { uploadProfilePic as uploadMiddleware } from '../middlewares/upload';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validations/authValidation';

const router = express.Router();

router.route('/register').post(validate(registerSchema), registerUser);

router.route('/login').post(validate(loginSchema), loginUser);

router.route('/logout').post(authenticate, logoutUser);

router
  .route('/upload-profile-pic')
  .patch(authenticate, uploadMiddleware, uploadProfilePic);

router
  .route('/forget-password')
  .post(validate(forgotPasswordSchema), forgetPassword);

router
  .route('/reset-password')
  .post(validate(resetPasswordSchema), resetPassword);

router.route('/profile').get(authenticate, getProfile);

export default router;
