const express = require('express');
const router = express.Router();
const { getProfile, getPatients, getPatientProfile } = require('../controllers/doctorController');
const { handlePrediction, handleTreatment, handleFullReport } = require("../controllers/aiController");
const { getProfileValidator, getPatientsValidator, getPatientProfileValidator } = require('../validators/doctorValidator');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');


router
    .route('/:id')
    .get(
        authenticateToken,
        authorizeRoles('doctor'),
        getProfileValidator,
        getProfile
    );


router
    .route('/:id/patients')
    .get(
        authenticateToken,
        authorizeRoles('doctor'),
        getPatientsValidator,
        getPatients
    );


router
    .route('/:doctorId/patients/:patientId')
    .get(
        authenticateToken,
        authorizeRoles('doctor'),
        getPatientProfileValidator,
        getPatientProfile
    );


router.post(
    "/predict",
    authenticateToken,
    authorizeRoles("doctor"),
    handlePrediction
);


router.post(
    "/treatment",
    authenticateToken,
    authorizeRoles("doctor"),
    handleTreatment
);


router.post(
    "/full_report",
    authenticateToken,
    authorizeRoles("doctor"),
    handleFullReport
);

module.exports = router;

