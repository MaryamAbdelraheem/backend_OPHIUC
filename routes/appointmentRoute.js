const express = require('express');
const router = express.Router();
const { createAppointmentValidator } = require('../validators/appointmentValidator');
const { createAppointment, getAllAppointmentsWithDoctorInfo } = require('../controllers/appointmentController');
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");


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


