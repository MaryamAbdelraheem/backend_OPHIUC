const ApiError = require('../utils/errors/ApiError');
const { Patient } = require("../models");
const asyncHandler = require('express-async-handler');

/**
 * @method PUT
 * @route /api/v1/patients/:id
 * @desc Update patient profile
 * @access public 
 */
exports.updateProfile = asyncHandler(async (req, res, next) => {
    const { id: patientId } = req.params;
    const {
        firstName,
        lastName,
        email,
        password,
        phoneNumber,
        medicalHistory,
        age,
        height,
        weight,
        gender,
        img
    } = req.body;

    const patient = await Patient.findByPk(patientId);

    if (!patient) {
        return next(new ApiError("Patient not found", 404))
    }

    // Update fields only if submitted
    if (firstName) patient.firstName = firstName;
    if (lastName) patient.lastName = lastName;
    if (email) patient.email = email;
    if (password) patient.password = password; 
    if (height) patient.height = height;
    if (weight) patient.weight = weight;
    if (gender !== undefined) {
        const genderMap = { 0: "Male", 1: "Female" };
        const genderString = genderMap[gender];
        if (!genderString) {
            return next(new ApiError("Invalid gender value", 400));
        }
        patient.gender = genderString;
    }
    if (phoneNumber) patient.phoneNumber = phoneNumber;
    if (medicalHistory) patient.medicalHistory = medicalHistory;
    if (age) patient.age = age;
    if (img) patient.img = img;

    // Save any ubdates
    await patient.save();

    // Exclude password  from response
    const patientData = patient.toJSON();
    delete patientData.password;

    res.status(200).json({
        status: 'success',
        message: "Profile updated successfully",
        data: {
            patient: patientData
        }
    });
});

/**
 * @method GET
 * @route /api/v1/patients/:id
 * @desc View patient profile
 * @access public 
 */
exports.getProfile = asyncHandler(async (req, res, next) => {
    const { id: patientId } = req.params;
    const patient = await Patient.findByPk(patientId, {
        attributes: { exclude: ['password'] }
    });

    if (!patient) {
        return next(new ApiError("Patient not found", 404))
    }

    res.status(200).json({
        status: 'success',
        message: "Patient profile fetched successfully",
        data: {
            patient
        }
    });
});

