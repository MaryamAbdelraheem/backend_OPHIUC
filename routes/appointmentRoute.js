const express = require('express');
const router = express.Router();
const { createAppointment, getAllAppointmentsWithDoctorInfo } = require('../controllers/appointmentController');
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");
const { appointmentValidationRules } = require('../validators/appointmentValidator');

/**
 * @route /api/v1/appointments
 * @access private
 */
router
    .route('/')
    .post(
        authenticateToken,
        authorizeRoles('doctor'),
        appointmentValidationRules(),
        createAppointment
    )
    .get(
        authenticateToken,
        authorizeRoles('doctor' , 'patient'),
        getAllAppointmentsWithDoctorInfo
    );
    /*.get(
        authenticateToken,
        authorizeRoles('admin'),
        getPatientsForDoctor*/

module.exports = router;