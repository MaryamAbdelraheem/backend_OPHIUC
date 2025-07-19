const { body, param } = require("express-validator");
const { validateRequest } = require('../middleware/validateRequest');
const genderMap = require('../utils/genderMap');

exports.addDoctorValidator = [
    body("firstName")
        .notEmpty().withMessage("First name is required")
        .isLength({ min: 2 }).withMessage("First name must be at least 2 characters"),

    body("lastName")
        .notEmpty().withMessage("Last name is required")
        .isLength({ min: 2 }).withMessage("Last name must be at least 2 characters"),

    body("email")
        .isEmail().withMessage("Valid email is required")
        .normalizeEmail(),

    body("password")
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),

    body("phoneNumber")
        .notEmpty().withMessage("Phone number is required")
        .matches(/^01[0-9]{9}$/).withMessage("Phone number must be a valid Egyptian number"),

    body("specialization")
        .notEmpty().withMessage("Specialization is required"),

    body("gender")
        .notEmpty().withMessage('Gender is required')
        .custom((value) => {
            if (!genderMap.hasOwnProperty(value)) {
                throw new Error("Gender must be 0 (Male) or 1 (Female), or 'Male' / 'Female'");
            }
            return true;
        })
        .customSanitizer((value) => genderMap[value]),
    validateRequest
];

exports.deleteDoctorValidator = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('Doctor ID must be a positive integer'),
    validateRequest,
];