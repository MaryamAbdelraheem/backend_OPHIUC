const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const {  } = require('../validators/authValidator');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');


/**
 * @route /api/doctor/:id
 * @access protected
 */
router
    .route('/:id')
    .get(
        authenticateToken,
        authorizeRoles('doctor'),
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
        authorizeRoles('doctor'),
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
        authorizeRoles('doctor'),
        doctorController.getPatientProfile
    )



module.exports = router;