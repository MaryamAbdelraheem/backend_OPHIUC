const { body } = require('express-validator');
const { validateRequest } = require("../middleware/validateRequest");
const genderMap = require('../utils/genderMap');
// Signup validation 

exports.signupValidator = [
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
        .isFloat({ min: 0 }).withMessage('Height must be a positive number'),

    body('weight')
        .notEmpty().withMessage('Weight is required')
        .isFloat({ min: 0 }).withMessage('Weight must be a positive number'),

    body('gender')
        .notEmpty().withMessage('Gender is required')
        .custom((value) => {
            if (!genderMap.hasOwnProperty(value)) {
                throw new Error("Gender must be 0 (Male) or 1 (Female), or 'Male' / 'Female'");
            }
            return true;
        })
        .bail()
        .customSanitizer(value => genderMap[value]),
    body('age')
        .notEmpty().withMessage('Age is required')
        .isInt({ min: 0 }).withMessage('Age must be a positive integer'),

    body('doctorId')
        .notEmpty().withMessage('DoctorId is required')
        .isInt({ min: 1 }).withMessage('Doctor ID must be a valid integer'),
    validateRequest
];

//Login validation
exports.loginValidator = [
    body('email')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please enter a valid email address'),

    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
    validateRequest
];