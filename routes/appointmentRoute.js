const express = require('express');
const router = express.Router();
const { createAppointment, getAllAppointmentsWithDoctorInfo } = require('../controllers/appointmentController');
const { authenticateToken, authorizeRole } = require("../middleware/authMiddleware");
const { validateRequest } = require('../middleware/validateRequest');
const { appointmentValidationRules } = require('../validators/appointmentValidator');

/**
 * @route /api/appointment
 * @access private
 */
router
    .route('/')
    .post(
        authenticateToken,
        authorizeRole('doctor'),
        appointmentValidationRules(),
        validateRequest,
        createAppointment
    )
    .get(
        authenticateToken,
        authorizeRole('patient'),
        getAllAppointmentsWithDoctorInfo
    )
module.exports = router;