import express from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
  uploadProfilePic,
  forgetPassword,
  resetPassword,
} from '../controllers/authController';

const router = express.Router();

router.route('/register').post(registerUser);

router.route('/login').post(loginUser);

router.route('/logout').post(logoutUser);

router.route('/uplaod-profile-pic').patch(uploadProfilePic);

router.route('/forget-password').post(forgetPassword);

router.route('/reset-password').post(resetPassword);

export default router;
