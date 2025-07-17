const express = require("express");
const router = express.Router();
const {getProfile, updateProfile} = require("../controllers/patientController");
const { handlePrediction, handleTreatment, handleReport } = require("../controllers/aiController");
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
 * @route http://localhost:4000/api/v1/patients/predict
 * @access protected
 */
router.post(
    "/predict",
    authenticateToken,
    authorizeRoles("patient"),
    handlePrediction
);

/**
 * @route http://localhost:4000/api/v1/patients/treatment
 * @access protected
 */
router.post(
    "/treatment",
    authenticateToken,
    authorizeRoles("patient"),
    handleTreatment
);

/**
 * @route http://localhost:4000/api/v1/patients/report
 * @access protected
 */
router.post(
    "/report",
    authenticateToken,
    authorizeRoles("patient"),
    handleReport
);


module.exports = router;