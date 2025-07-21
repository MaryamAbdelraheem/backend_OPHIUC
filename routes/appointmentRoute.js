const express = require('express');
const router = express.Router();
const { createAppointmentValidator } = require('../validators/appointmentValidator');
const { createAppointment, getAllAppointmentsWithDoctorInfo } = require('../controllers/appointmentController');
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");

/**
 * @swagger
 * /appointments:
 *   post:
 *     summary: Create a new appointment
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patient_id
 *               - appointment_date
 *             properties:
 *               patient_id:
 *                 type: integer
 *                 example: 3
 *               appointment_date:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-07-22T10:30:00"
 *     responses:
 *       201:
 *         description: Appointment created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (only doctors can create)
 *
 *   get:
 *     summary: Get all appointments for the authenticated user
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of appointments with doctor info
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   appointmentId:
 *                     type: integer
 *                   doctorName:
 *                     type: string
 *                   specialty:
 *                     type: string
 *                   date:
 *                     type: string
 *                   time:
 *                     type: string
 *       401:
 *         description: Unauthorized
 */
router
    .route('/')
    .post(
        authenticateToken,
        authorizeRoles('doctor'),
        createAppointmentValidator,
        createAppointment
    )
    .get(
        authenticateToken,
        authorizeRoles('doctor', 'patient'),
        getAllAppointmentsWithDoctorInfo
    );

module.exports = router;


// const express = require('express');
// const router = express.Router();
// const { createAppointmentValidator } = require('../validators/appointmentValidator');
// const { createAppointment, getAllAppointmentsWithDoctorInfo } = require('../controllers/appointmentController');
// const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");
// /**
//  * @route GET, POST /api/v1/appointments
//  * @access private
//  */

// router
//     .route('/')
//     .post(
//         authenticateToken,
//         authorizeRoles('doctor'),
//         createAppointmentValidator,
//         createAppointment
//     )
//     .get(
//         authenticateToken,
//         authorizeRoles('doctor', 'patient'),
//         getAllAppointmentsWithDoctorInfo
//     );

// module.exports = router;