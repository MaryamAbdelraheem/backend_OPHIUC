
const express = require('express');
const passport = require('passport');
const router = express.Router();
const { signupPatientValidationRules , loginValidationRules } = require('../validators/authValidator')
const { signupPatient, login, logout, googleCallback, completeProfile } = require('../controllers/authController');
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
@route GET /api/auth/google
**/
router
    .route('/google')
    .get(
    passport.authenticate('google', 
        {
        scope: ['profile', 'email'],
        session: false
        }
    )
)

/** 
@route GET /api/auth/google/callback
**/
router
    .route('/google/callback')
    .get(
    passport.authenticate('google', 
        { session: false, failureRedirect: '/login' }),
    googleCallback
)

/** 
@route POST /api/auth/complete-profile
**/
router
    .route('/complete-profile')
    .post(
    authenticateToken,
    completeProfile
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
