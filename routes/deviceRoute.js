const express = require('express');
const router = express.Router();
const { bindDeviceToPatient } = require('../controllers/deviceController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Devices
 *   description: Device management for patients
 */

/**
 * @swagger
 * /devices/bind:
 *   post:
 *     summary: Bind a device to the authenticated patient
 *     tags: [Devices]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - deviceId
 *             properties:
 *               deviceId:
 *                 type: string
 *                 example: "device123"
 *     responses:
 *       200:
 *         description: Device successfully bound to patient
 *       400:
 *         description: Validation error or device not found
 *       401:
 *         description: Unauthorized
 */
router
    .route('/bind')
    .post(
        authenticateToken,
        authorizeRoles('patient'),
        bindDeviceToPatient
    );

module.exports = router;


// const express = require('express');
// const router = express.Router();
// const { bindDeviceToPatient } = require('../controllers/deviceController');
// const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

// router
//     .route('/bind')
//     .post(
//         authenticateToken,
//         authorizeRoles('patient'),
//         bindDeviceToPatient
//     )

// module.exports = router;