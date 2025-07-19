const { body, param } = require("express-validator");
const { validateRequest } = require('../middleware/validateRequest');

exports.createAppointmentValidator = [
    body('patient_id')
        .isInt({ min: 1 })
        .withMessage('Patient ID must be a positive integer'),
    body('appointment_date')
        .notEmpty()
        .withMessage('Appointment date is required')
        .isISO8601()
        .withMessage('Appointment date must be a valid ISO 8601 date'),

    validateRequest
]