const express = require("express");
const router = express.Router();
const {getProfile, updateProfile} = require("../controllers/patientController");
const { handlePrediction, handleTreatment, handleReport, handleFullReport } = require("../controllers/aiController");
const { } = require("../validators/authValidator");
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");

//
/**
 * @route /api/patient/:id
 * @access Protected 
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
 * @route https://sleep-apnea-api-production.up.railway.app/predict
 * @access protected
 */
router
    .route("/predict")
    .post(
        authenticateToken,
        authorizeRoles("doctor", "patient"),
        handlePrediction
    );
/**
 * @route https://sleep-apnea-api-production.up.railway.app/treatment
 * @access protected
 */
router
    .route("/treatment")
    .post(
        authenticateToken,
        authorizeRoles("doctor", "patient"),
        handleTreatment
    );

/**
 * @route https://sleep-apnea-api-production.up.railway.app/report
 * @access protected
 */
router
    .route('/report')
    .post(
        authenticateToken,
        authorizeRoles("patient"),
        handleReport
    )

/**
 * @route https://sleep-apnea-api-production.up.railway.app/full_report
 * @access protected
 */
router
    .route('/full_report')
    .post(
        authenticateToken,
        authorizeRoles("doctor"),
        handleFullReport
    );

module.exports = router;