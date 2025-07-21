const express = require("express");
const router = express.Router();
const { getProfile, updateProfile } = require("../controllers/patientController");
const { handlePrediction, handleTreatment, handleReport } = require("../controllers/aiController");
const { updateProfileValidator, getProfileValidator } = require("../validators/patientValidator");
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");


router
    .route('/:id')
    .get(
        authenticateToken,
        authorizeRoles('patient'),
        getProfileValidator,
        getProfile
    )
    .put(
        authenticateToken,
        authorizeRoles('patient'),
        updateProfileValidator,
        updateProfile
    );



router
    .route('/predict')
    .post(
        authenticateToken,
        authorizeRoles("patient"),
        handlePrediction
    );


router
    .route('/treatment')
    .post(
        authenticateToken,
        authorizeRoles("patient"),
        handleTreatment
    );


router
    .route('/report')
    .post(
        authenticateToken,
        authorizeRoles("patient"),
        handleReport
    );

module.exports = router;



