const express = require('express');
const router = express.Router();
const { getProfile, getPatients, getPatientProfile } = require('../controllers/doctorController');
const { handlePrediction, handleTreatment, handleFullReport } = require("../controllers/aiController");
const { getProfileValidator, getPatientsValidator, getPatientProfileValidator } = require('../validators/doctorValidator');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

/**
 * @swagger
 * /doctors/{id}:
 *   get:
 *     summary: Get doctor profile
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Doctor ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Doctor profile fetched successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Doctor not found
 */
router
    .route('/:id')
    .get(
        authenticateToken,
        authorizeRoles('doctor'),
        getProfileValidator,
        getProfile
    );

/**
 * @swagger
 * /doctors/{id}/patients:
 *   get:
 *     summary: Get all patients assigned to a doctor
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Doctor ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of patients fetched successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Doctor or patients not found
 */
router
    .route('/:id/patients')
    .get(
        authenticateToken,
        authorizeRoles('doctor'),
        getPatientsValidator,
        getPatients
    );

/**
 * @swagger
 * /doctors/{doctorId}/patients/{patientId}:
 *   get:
 *     summary: Get profile of a specific patient under a doctor
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Patient profile fetched successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Patient not found
 */
router
    .route('/:doctorId/patients/:patientId')
    .get(
        authenticateToken,
        authorizeRoles('doctor'),
        getPatientProfileValidator,
        getPatientProfile
    );

/**
 * @swagger
 * /doctors/predict:
 *   post:
 *     summary: Predict diagnosis based on patient vitals
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               age:
 *                 type: number
 *               gender:
 *                 type: string
 *               snoring:
 *                 type: number
 *               oxygen_saturation:
 *                 type: number
 *               bmi:
 *                 type: number
 *               ahi:
 *                 type: number
 *     responses:
 *       200:
 *         description: Prediction result
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post(
    "/predict",
    authenticateToken,
    authorizeRoles("doctor"),
    handlePrediction
);

/**
 * @swagger
 * /doctors/treatment:
 *   post:
 *     summary: Generate treatment plan
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               severity:
 *                 type: number
 *               gender:
 *                 type: string
 *               bmi:
 *                 type: number
 *               snoring:
 *                 type: number
 *               ahi:
 *                 type: number
 *     responses:
 *       200:
 *         description: Treatment plan generated
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post(
    "/treatment",
    authenticateToken,
    authorizeRoles("doctor"),
    handleTreatment
);

/**
 * @swagger
 * /doctors/full_report:
 *   post:
 *     summary: Generate full report for a patient
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               age:
 *                 type: number
 *               gender:
 *                 type: string
 *               snoring:
 *                 type: number
 *               oxygen_saturation:
 *                 type: number
 *               bmi:
 *                 type: number
 *               ahi:
 *                 type: number
 *     responses:
 *       200:
 *         description: Full report generated
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post(
    "/full_report",
    authenticateToken,
    authorizeRoles("doctor"),
    handleFullReport
);

module.exports = router;


// const express = require('express');
// const router = express.Router();
// const { getProfile, getPatients, getPatientProfile } = require('../controllers/doctorController');
// const { handlePrediction, handleTreatment, handleFullReport } = require("../controllers/aiController");
// const { getProfileValidator, getPatientsValidator, getPatientProfileValidator } = require('../validators/doctorValidator');
// const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');


// /**
//  * @route GET /api/v1/doctors/:id
//  * @access protected
//  */
// router
//     .route('/:id')
//     .get(
//         authenticateToken,
//         authorizeRoles('doctor'),
//         getProfileValidator,
//         getProfile
//     )

// /**
//  * @route GET /api/v1/doctors/:id/patients
//  * @access protected
//  */
// router
//     .route('/:id/patients')
//     .get(
//         authenticateToken,
//         authorizeRoles('doctor'),
//         getPatientsValidator,
//         getPatients
//     )

// /**
//  * @route GET /api/v1/doctors/:doctorId/patients/:patientId
//  * @access protected
//  */
// router
//     .route('/:doctorId/patients/:patientId')
//     .get(
//         authenticateToken,
//         authorizeRoles('doctor'),
//         getPatientProfileValidator,
//         getPatientProfile
//     )

// // Existing routes
// // AI Routes for Doctor
// /**
//  * @route POST http://localhost:4000/api/v1/doctors/predict
//  * @access protected
//  */

// router.post(
//     "/predict",
//     authenticateToken,
//     authorizeRoles("doctor"),
//     handlePrediction
// );
// /**
//  * @route POST http://localhost:4000/api/v1/doctors/treatment
//  * @access protected
//  */

// router.post(
//     "/treatment",
//     authenticateToken,
//     authorizeRoles("doctor"),
//     handleTreatment
// );
// /**
//  * @route POST http://localhost:4000/api/v1/doctors/full_report
//  * @access protected
//  */
// router.post(
//     "/full_report",
//     authenticateToken,
//     authorizeRoles("doctor"),
//     handleFullReport
// );
// module.exports = router;