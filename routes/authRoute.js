const express = require('express');
const router = express.Router();
const { signupPatientValidator, loginValidator } = require('../validators/authValidator');
const { signupPatient, login, logout, forgotPassword, resetPassword, changePassword } = require('../controllers/authController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const { forgotPasswordLimiter } = require('../middleware/rateLimiter');
/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication routes
 */

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Signup as a new patient
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *               - age
 *               - gender
 *               - height
 *               - weight
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               age:
 *                 type: integer
 *               gender:
 *                 type: string
 *                 enum: [male, female]
 *               height:
 *                 type: number
 *               weight:
 *                 type: number
 *               doctorId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Patient registered successfully
 *       400:
 *         description: Validation error
 */
router
    .route('/signup')
    .post(
        signupPatientValidator,
        signupPatient
    );

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login as a patient or doctor
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logged in successfully
 *       400:
 *         description: Invalid credentials
 */
router
    .route('/login')
    .post(
        loginValidator,
        login
    );

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout the currently logged-in user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       401:
 *         description: Unauthorized
 */
router
    .route('/logout')
    .post(
        authenticateToken,
        authorizeRoles('patient', 'doctor'),
        logout
    );
/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Send a password reset link to email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Reset link sent
 *       400:
 *         description: Email not found
 */
router
    .route('/forgot-password')
    .post(
        forgotPasswordLimiter,
        forgotPassword
    );

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset password using token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid or expired token
 */
router
    .route('/reset-password')
    .post(
        resetPassword
    );
/**
 * @swagger
 * /auth/change-password:
 *   post:
 *     summary: Change password for the authenticated user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 example: old_password123
 *               newPassword:
 *                 type: string
 *                 example: new_password456
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Validation error or old password incorrect
 *       401:
 *         description: Unauthorized
 */

router
    .route('/change-password')
    .post(
        authenticateToken,
        authorizeRoles("patient", "doctor"),
        changePassword
    );

module.exports = router;
