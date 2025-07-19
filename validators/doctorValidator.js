const { body, param } = require('express-validator');
const { validateRequest } = require("../middleware/validateRequest");

exports.getProfileValidator = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('Doctor ID must be a positive integer'),
    validateRequest,
];

exports.getPatientsValidator = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('Doctor ID must be a positive integer'),
    validateRequest
];

exports.getPatientProfileValidator = [
    param('doctorId')
        .isInt({ min: 1 })
        .withMessage('Doctor ID must be a positive integer'),
    param('patientId')
        .isInt({ min: 1 })
        .withMessage('Patient ID must be a positive integer'),
    validateRequest
];