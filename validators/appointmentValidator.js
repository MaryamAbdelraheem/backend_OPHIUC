const { body } = require('express-validator');

exports.appointmentValidationRules = () => [
    body('patient_id')
        .notEmpty().withMessage('Patient ID is required')
        .isInt({ min: 1 }).withMessage('Patient ID must be a valid integer'),

    body('appointment_date')
        .notEmpty().withMessage('Appointment date is required')
        .isISO8601().withMessage('Invalid date format'),

    body('notes')
        .optional()
        .isString().withMessage('Notes must be text')
        .isLength({ max: 1000 }).withMessage('Notes cannot exceed 1000 characters')
];
