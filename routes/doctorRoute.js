const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const { handlePrediction, handleTreatment, handleFullReport } = require("../controllers/aiController");
const { } = require('../validators/authValidator');
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

// Existing routes
// AI Routes for Doctor
/**
 * @route http://localhost:4000/api/v1/doctors/predict
 * @access protected
 */

router.post(
    "/predict",
    authenticateToken,
    authorizeRoles("doctor"),
    handlePrediction
);
/**
 * @route http://localhost:4000/api/v1/doctors/treatment
 * @access protected
 */

router.post(
    "/treatment",
    authenticateToken,
    authorizeRoles("doctor"),
    handleTreatment
);
/**
 * @route http://localhost:4000/api/v1/doctors/full_report
 * @access protected
 */
router.post(
    "/full_report",
    authenticateToken,
    authorizeRoles("doctor"),
    handleFullReport
);
module.exports = router;