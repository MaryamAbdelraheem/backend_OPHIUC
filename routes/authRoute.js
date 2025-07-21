const express = require('express');
const router = express.Router();
const { signupPatientValidator, loginValidator } = require('../validators/authValidator')
const { signupPatient, login, logout } = require('../controllers/authController');
const { authorizeRoles, authenticateToken } = require('../middleware/authMiddleware');

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

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout the currently logged in user
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
    .route('/signup')
    .post(
        signupPatientValidator,
        signupPatient
    )

router
    .route('/login')
    .post(
        loginValidator,
        login
    )

router
    .route('/logout')
    .post(
        authenticateToken,
        authorizeRoles('patient', 'doctor'),
        logout
    )

module.exports = router;




// const express = require('express');
// const router = express.Router();
// const { signupPatientValidator, loginValidator } = require('../validators/authValidator')
// const { signupPatient, login, logout } = require('../controllers/authController');
// const { authorizeRoles, authenticateToken } = require('../middleware/authMiddleware');


// /**
//  * @route POST /api/v1/auth/signup
//  */
// router
//     .route('/signup')
//     .post(
//         signupPatientValidator,
//         signupPatient
//     )


// /**
//  * @route POST /api/v1/auth/login
//  */
// router
//     .route('/login')
//     .post(
//         loginValidator,
//         login
//     )


// /**
//  * @route POST /api/v1/auth/logout
//  */
// router
//     .route('/logout')
//     .post(
//         authenticateToken,
//         authorizeRoles('patient', 'doctor'),
//         logout
//     )

// module.exports = router;
