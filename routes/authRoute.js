const express = require('express');
const router = express.Router();
const { signupValidator, loginValidator } = require('../validators/authValidator');
const { signup, login, logout, forgotPassword, resetPassword, changePassword } = require('../controllers/authController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const { forgotPasswordLimiter } = require('../middleware/rateLimiter');

router
    .route('/signup')
    .post(
        signupValidator,
        signup
    );


router
    .route('/login')
    .post(
        loginValidator,
        login
    );


router
    .route('/logout')
    .post(
        authenticateToken,
        authorizeRoles('patient', 'doctor'),
        logout
    );

router
    .route('/forgot-password')
    .post(
        forgotPasswordLimiter,
        forgotPassword
    );


router
    .route('/reset-password')
    .post(
        resetPassword
    );

router
    .route('/change-password')
    .post(
        authenticateToken,
        authorizeRoles("patient", "doctor"),
        changePassword
    );

module.exports = router;
