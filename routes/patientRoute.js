const express = require("express");
const router = express.Router();
const { getProfile, updateProfile } = require("../controllers/patientController");
const { handlePrediction, handleTreatment, handleReport } = require("../controllers/aiController");
const { updateProfileValidator, getProfileValidator } = require("../validators/patientValidator");
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");

/**
 * @swagger
 * /patients/{id}:
 *   get:
 *     summary: Get patient profile
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Patient ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Patient profile fetched successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Patient not found
 *   put:
 *     summary: Update patient profile
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Patient ID
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               age:
 *                 type: number
 *               gender:
 *                 type: string
 *               height:
 *                 type: number
 *               weight:
 *                 type: number
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
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

/**
 * @swagger
 * /patients/predict:
 *   post:
 *     summary: Predict diagnosis based on vitals
 *     tags: [Patients]
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
router
    .route('/predict')
    .post(
        authenticateToken,
        authorizeRoles("patient"),
        handlePrediction
    );

/**
 * @swagger
 * /patients/treatment:
 *   post:
 *     summary: Generate treatment plan for patient
 *     tags: [Patients]
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
router
    .route('/treatment')
    .post(
        authenticateToken,
        authorizeRoles("patient"),
        handleTreatment
    );

/**
 * @swagger
 * /patients/report:
 *   post:
 *     summary: Generate summary report for patient
 *     tags: [Patients]
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
 *         description: Report generated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router
    .route('/report')
    .post(
        authenticateToken,
        authorizeRoles("patient"),
        handleReport
    );

module.exports = router;



// const express = require("express");
// const router = express.Router();
// const { getProfile, updateProfile } = require("../controllers/patientController");
// const { handlePrediction, handleTreatment, handleReport } = require("../controllers/aiController");
// const { updateProfileValidator, getProfileValidator } = require("../validators/patientValidator");
// const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");

// /**
//  * @route GET, PUT /api/v1/patients/:id
//  * @access protected 
//  */
// router
//     .route('/:id')
//     .get(
//         authenticateToken,
//         authorizeRoles('patient'),
//         getProfileValidator,
//         getProfile
//     )
//     .put(
//         authenticateToken,
//         authorizeRoles('patient'),
//         updateProfileValidator,
//         updateProfile
//     )



// // Existing routes from Railway Server
// // AI Routes for Patient
// /**
//  * @route POST http://localhost:4000/api/v1/patients/predict
//  * @access protected
//  */
// router
//     .route('/predict')
//     .post(
//         authenticateToken,
//         authorizeRoles("patient"),
//         handlePrediction
//     );

// /**
//  * @route POST http://localhost:4000/api/v1/patients/treatment
//  * @access protected
//  */
// router
//     .route('/treatment')
//     .post(
//         authenticateToken,
//         authorizeRoles("patient"),
//         handleTreatment
//     );

// /**
//  * @route POST http://localhost:4000/api/v1/patients/report
//  * @access protected
//  */
// router
//     .route('/report')
//     .post(
//         authenticateToken,
//         authorizeRoles("patient"),
//         handleReport
//     );


// module.exports = router;