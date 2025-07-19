const express = require("express");
const router = express.Router();
const { getProfile, updateProfile } = require("../controllers/patientController");
const { handlePrediction, handleTreatment, handleReport } = require("../controllers/aiController");
const { } = require("../validators/authValidator");
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");

/**
 * @route GET, PUT /api/v1/patients/:id
 * @access protected 
 */
router
    .route('/:id')
    .get(
        authenticateToken,
        authorizeRoles('patient'),
        getProfile
    )
    .put(
        authenticateToken,
        authorizeRoles('patient'),
        updateProfile
    )



// Existing routes from Railway Server
// AI Routes for Patient
/**
 * @route POST http://localhost:4000/api/v1/patients/predict
 * @access protected
 */
router
    .route('/predict')
    .post(
        authenticateToken,
        authorizeRoles("patient"),
        handlePrediction
    );

/**
 * @route POST http://localhost:4000/api/v1/patients/treatment
 * @access protected
 */
router
    .route('/treatment')
    .post(
        authenticateToken,
        authorizeRoles("patient"),
        handleTreatment
    );

/**
 * @route POST http://localhost:4000/api/v1/patients/report
 * @access protected
 */
router
    .route('/report')
    .post(
        authenticateToken,
        authorizeRoles("patient"),
        handleReport
    );


module.exports = router;