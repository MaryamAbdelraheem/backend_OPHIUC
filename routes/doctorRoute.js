const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const authDoctorController = require('../controllers/authDoctorController');
const { loginValidationRules } = require('../validators/authValidator');
const { validateRequest } = require('../middleware/validateRequest');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// Public routes
/**
 * @route /api/doctor/login
 * @access public
 */
router
    .route('/login')
    .post(
        loginValidationRules(),
        validateRequest,
        authDoctorController.login
    )


// Protected routes - require doctor role
/**
 * @route /api/doctor/logout
 * @access protected
 */
router
    .route('/logout')
    .post(
        authenticateToken,
        authorizeRole('doctor'),
        authDoctorController.logout
    )

/**
 * @route /api/doctor/:id
 * @access protected
 */
router
    .route('/:id')
    .get(
        authenticateToken,
        authorizeRole('doctor'),
        doctorController.getProfile
    )

/**
 * @route /api/doctor/:id/patients
 * @access protected
 */
router
    .route('/:id/patients')
    .get(
        authenticateToken,
        authorizeRole('doctor'),
        doctorController.getPatients
    )

/**
 * @route /api/doctor/:doctorId/patients/:patientId
 * @access protected
 */
router
    .route('/:doctorId/patients/:patientId')
    .get(
        authenticateToken,
        authorizeRole('doctor'),
        doctorController.getPatientProfile
    )



module.exports = router;