const express = require('express');
const router = express.Router();
const { signupPatientValidationRules , loginValidationRules } = require('../validators/authValidator')
const { signupPatient, login, logout } = require('../controllers/authController');
const { authorizeRoles, authenticateToken } = require('../middleware/authMiddleware');


/**
 * @route POST /api/v1/auth/signup
 */
router
    .route('/signup')
    .post(
        signupPatientValidationRules,
        signupPatient
    )


/**
 * @route POST /api/v1/auth/login
 */
router
    .route('/login')
    .post(
        loginValidationRules,
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
