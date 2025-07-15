const express = require("express");
const router = express.Router();
const aiController = require("../controllers/aiController");
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
        aiController.handlePrediction
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
        aiController.handleTreatment
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
        aiController.handleReport
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
        aiController.handleFullReport
    )


module.exports = router;