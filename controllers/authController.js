const asyncHandler = require('express-async-handler');
const authService = require('../services/authServices');
const passwordService = require('../services/passwordService');

const SECRET_KEY = process.env.JWT_SECRET || "ophiucs-project-secret-jwt";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

const STATIC_ADMIN = {
    id: 1,
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    role: "admin",
};

// signup(req, res, next)
exports.signup = asyncHandler(async (req, res) => {
  const { patient, token } = await authService.signup(req.body);

  res.status(201).json({
    status: 'success',
    message: 'Patient account created successfully',
    data: patient,
    token
  });
});

// login(req, res, next)
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { user, token } = await authService.login({ email, password });

  res.status(200).json({
    status: 'success',
    message: `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} login successful`,
    data: user,
    token
  });
});

// logout(req, res, next)
exports.logout = asyncHandler(async (req, res) => {
  const token = req.token;
  await passwordService.logout(token);

  res.status(200).json({
    status: 'success',
    message: 'You have been logged out successfully'
  });
});

// forgotPassword(req, res, next)
exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  await passwordService.forgotPassword(email);

  res.status(200).json({
    status: 'success',
    message: 'Password reset link has been sent to your email'
  });
});

// resetPassword(req, res, next)
exports.resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;
  await passwordService.resetPassword(token, newPassword);

  res.status(200).json({
    status: 'success',
    message: 'Password has been reset successfully'
  });
});

// changePassword(req, res, next)
exports.changePassword = asyncHandler(async (req, res) => {
  const user = req.user;
  const { oldPassword, newPassword } = req.body;

  await passwordService.changePassword(user, oldPassword, newPassword);

  res.status(200).json({
    status: 'success',
    message: 'Password changed successfully'
  });
});
