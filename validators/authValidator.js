const { body } = require('express-validator');
const { validateRequest } = require("../middleware/validateRequest");

// Signup validation 
exports.signupPatientValidationRules = [
    body('firstName')
        .notEmpty().withMessage('First name is required')
        .isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),

    body('lastName')
        .notEmpty().withMessage('Last name is required')
        .isLength({ min: 2 }).withMessage('Last name must be at least 2 characters'),

    body('email')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please enter a valid email address'),

    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),

    body('height')
        .notEmpty().withMessage('Height is required')
        .isNumeric().withMessage('Height must be a number'),

    body('weight')
        .notEmpty().withMessage('Weight is required')
        .isNumeric().withMessage('Weight must be a number'),

    body('gender')
        .notEmpty().withMessage('Gender is required')
        .isIn([0, 1]).withMessage('Gender must be 0 (Male) or 1 (Female)'),

    body('age')
        .optional()
        .isInt({ min: 0 }).withMessage('Age must be a positive integer'),

    body('doctorId')
        .optional()
        .isInt({ min: 1 }).withMessage('Doctor ID must be a valid integer'),
    validateRequest
];

//Login validation
exports.loginValidationRules = [
    body('email')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please enter a valid email address'),

    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
    validateRequest
];