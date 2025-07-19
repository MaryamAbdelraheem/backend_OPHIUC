const express = require('express');
const router = express.Router();
const { getProfile, getPatients, getPatientProfile } = require('../controllers/doctorController');
const { handlePrediction, handleTreatment, handleFullReport } = require("../controllers/aiController");
const { getProfileValidator, getPatientsValidator, getPatientProfileValidator } = require('../validators/doctorValidator');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');


/**
 * @route GET /api/v1/doctors/:id
 * @access protected
 */
router
    .route('/:id')
    .get(
        authenticateToken,
        authorizeRoles('doctor'),
        getProfileValidator,
        getProfile
    )

/**
 * @route GET /api/v1/doctors/:id/patients
 * @access protected
 */
router
    .route('/:id/patients')
    .get(
        authenticateToken,
        authorizeRoles('doctor'),
        getPatientsValidator,
        getPatients
    )

/**
 * @route GET /api/v1/doctors/:doctorId/patients/:patientId
 * @access protected
 */
router
    .route('/:doctorId/patients/:patientId')
    .get(
        authenticateToken,
        authorizeRoles('doctor'),
        getPatientProfileValidator,
        getPatientProfile
    )

// Existing routes
// AI Routes for Doctor
/**
 * @route POST http://localhost:4000/api/v1/doctors/predict
 * @access protected
 */

router.post(
    "/predict",
    authenticateToken,
    authorizeRoles("doctor"),
    handlePrediction
);
/**
 * @route POST http://localhost:4000/api/v1/doctors/treatment
 * @access protected
 */

router.post(
    "/treatment",
    authenticateToken,
    authorizeRoles("doctor"),
    handleTreatment
);
/**
 * @route POST http://localhost:4000/api/v1/doctors/full_report
 * @access protected
 */
router.post(
    "/full_report",
    authenticateToken,
    authorizeRoles("doctor"),
    handleFullReport
);
module.exports = router;