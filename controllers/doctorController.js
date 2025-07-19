const ApiError = require('../utils/errors/ApiError');
const { Doctor, Patient } = require('../models');
const asyncHandler = require('express-async-handler');

/**
 * @method GET
 * @route /api/v1/doctors/:id
 * @desc View doctor profile
 * @access public 
 */
exports.getProfile = asyncHandler(async (req, res, next) => {
    const { id: doctorId } = req.params;

    // 1. Check the doctor's presence    
    const doctor = await Doctor.findByPk(doctorId, {
        attributes: { exclude: ['email', 'password', 'createdAt', 'updatedAt', 'deletedAt'] }
    });

    if (!doctor) {
        return next(new ApiError("Doctor not found", 404))
    }

    res.status(200).json({
        status: 'success',
        message: "Doctor profile fetched successfully",
        data: {
            doctor
        }
    });
});


/**
 * @method GET
 * @route /api/v1/doctors/:id/patients
 * @desc View doctor patients
 * @access private 
 */
exports.getPatients = asyncHandler(async (req, res, next) => {
    const { id: doctorId } = req.params;

    // 1. Check the doctor's presence
    const doctor = await Doctor.findByPk(doctorId, {
        attributes: ['firstName', 'lastName'] // Fetch only firstName, lastName
    });

    if (!doctor) {
        return next(new ApiError("Doctor not found", 404))
    }

    // 2. Get a list of patients associated with the doctor
    const patients = await Patient.findAll({
        where: { doctorId }, // Filter by doctorId
        attributes: ['patientId', 'firstName', 'lastName', 'email', 'img'] // Fetch only firstName, lastName, email and img for patients
    });

    if (!patients || patients.length === 0) {
        return next(new ApiError("No patients found for this doctor", 404))
    }

    // 3. Response Data doctor, patient
    res.status(200).json({
        status: 'success',
        message: "Doctor's patients fetched successfully",
        data: {
            doctor,
            patients
        }
    });
});


/**
 * @method GET
 * @route /api/v1/doctors/:doctorId/patients/:patientId
 * @desc View patient profile for doctor
 * @access private
*/

exports.getPatientProfile = asyncHandler(async (req, res, next) => {
    const { doctorId, patientId } = req.params;

    // 1. Check the doctor's presence
    const doctor = await Doctor.findByPk(doctorId, {
        attributes: ['firstName', 'lastName']
    });

    if (!doctor) {
        return next(new ApiError("Doctor not found", 404))

    }

    // 2. Verify the presence of the patient associated with the doctor
    const patient = await Patient.findOne({
        where: {
            patientId: patientId,
            doctorId // Make sure the patient is actually following the doctor.
        },
        attributes: ['patientId', 'firstName', 'lastName', 'img']
    });

    if (!patient) {
        return next(new ApiError("Patient not found for this doctor", 404));
    }

    // 3. Response Data doctor, patient
    res.status(200).json({
        status: 'success',
        message: "Patient profile fetched successfully",
        data: {
            doctor,
            patient
        }
    });
});