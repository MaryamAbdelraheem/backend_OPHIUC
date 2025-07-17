const express = require("express");
const router = express.Router();
const { handlePrediction, handleTreatment, handleReport, handleFullReport} = require("../controllers/aiController");
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");



/**
 * @route /api/ai/predict
 * @access protected
 */
router
    .route('/predict')
    .post(
        authenticateToken,
        authorizeRoles("doctor", "patient"),
        handlePrediction
    )

/**
 * @route /api/ai/treatment
 * @access protected
 */
router
    .route('/treatment')
    .post(
        authenticateToken, 
        authorizeRoles("doctor", "patient"),
        handleTreatment
    )

/**
 * @route /api/ai/report
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
 * @route /api/ai/full_report
 * @access protected
 */
router
    .route('/full_report')
    .post(
        authenticateToken, 
        authorizeRoles("doctor"),
        handleFullReport
    )


module.exports = router;