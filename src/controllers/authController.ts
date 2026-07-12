import asyncWrapper from '../middlewares/asyncWrapper';

// register user
export const registerUser = asyncWrapper(async (req, res, next) => {});

// login user
export const loginUser = asyncWrapper(async (req, res, next) => {});

// logout user
export const logoutUser = asyncWrapper(async (req, res, next) => {});

// upload profile picture
export const uploadProfilePic = asyncWrapper(async (req, res, next) => {});

// forget password
export const forgetPassword = asyncWrapper(async (req, res, next) => {});

// reset password
export const resetPassword = asyncWrapper(async (req, res, next) => {});
