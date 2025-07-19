const { body, param } = require('express-validator');
const { validateRequest } = require('../middleware/validateRequest');
const genderMap = require("../utils/genderMap");

exports.updateProfileValidator = [
    body("firstName")
        .optional()
        .isString()
        .withMessage("First name must be a string"),
    body("lastName")
        .optional()
        .isString()
        .withMessage("Last name must be a string"),
    body("email")
        .optional()
        .isEmail()
        .withMessage("Invalid email address"),
    body("password")
        .optional()
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters"),
    body("phoneNumber")
        .optional()
        .isString()
        .withMessage("Phone number must be a string"),
    body("medicalHistory")
        .optional()
        .isString()
        .withMessage("Medical history must be a string"),
    body("age")
        .optional().isInt({ min: 0 }).withMessage("Age must be a positive integer"),
    body("height")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("Height must be a positive number"),
    body("weight")
        .optional()
        .isFloat({ min: 0 }).withMessage("Weight must be a positive number"),
    body("gender")
        .optional()
        .custom((value) => {
            if (!genderMap.hasOwnProperty(value)) {
                throw new Error("Gender must be 0 (Male), 1 (Female), 'Male', or 'Female'");
            }
            return true;
        })
        .bail()
        .customSanitizer(value => genderMap[value]),

    body("img").optional().isURL().withMessage("Image must be a valid URL"),

    validateRequest
];

exports.getProfileValidator = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('Patient ID must be a positive integer'),
    validateRequest,
];