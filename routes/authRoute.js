const express = require('express');
const router = express.Router();
const { signupPatientValidator, loginValidator } = require('../validators/authValidator')
const { signupPatient, login, logout } = require('../controllers/authController');
const { authorizeRoles, authenticateToken } = require('../middleware/authMiddleware');


/**
 * @route POST /api/v1/auth/signup
 */
router
    .route('/signup')
    .post(
        signupPatientValidator,
        signupPatient
    )


/**
 * @route POST /api/v1/auth/login
 */
router
    .route('/login')
    .post(
        loginValidator,
        login
    )


/**
 * @route POST /api/v1/auth/logout
 */
router
    .route('/logout')
    .post(
        authenticateToken,
        authorizeRoles('patient', 'doctor'),
        logout
    )

module.exports = router;
