const ApiError = require('../utils/errors/ApiError');
const bcrypt = require("bcryptjs");
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

    if (req.user.id !== Number(patientId)) {
        return next(new ApiError("Unauthorized access", 403));
    }

    const patient = await Patient.findByPk(patientId);
    if (!patient) {
        return next(new ApiError("Patient not found", 404));
    }

    const fieldsToUpdate = {
        firstName,
        lastName,
        email,
        phoneNumber,
        medicalHistory,
        age,
        height,
        weight,
        gender,
        img
    };

    for (const key in fieldsToUpdate) {
        if (fieldsToUpdate[key] !== undefined) {
            patient[key] = fieldsToUpdate[key];
        }
    }

    if (password) {
        const salt = await bcrypt.genSalt(10);
        patient.password = await bcrypt.hash(password, salt);
    }

    await patient.save();

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

