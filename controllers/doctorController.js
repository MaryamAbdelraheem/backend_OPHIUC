const ApiError = require('../utils/errors/ApiError');
const { Doctor, Patient } = require('../models'); // Ensure Patient is imported
const asyncHandler = require('express-async-handler'); // استيراد asyncHandler

/**
 * @method GET
 * @route /api/doctor/:id
 * @desc View doctor profile
 * @access public 
 */
exports.getProfile = asyncHandler(async (req, res, next) => {
    const { id: doctorId } = req.params;

    // 1. التحقق من وجود الطبيب
    const doctor = await Doctor.findByPk(doctorId, {
        attributes: { exclude: ['email', 'password', 'createdAt', 'updatedAt', 'deletedAt'] } // استثناء كلمة السر من النتيجة
    });

    if (!doctor) {
        return next(new ApiError("Doctor not found", 404))
    }

    // 2. إرسال بيانات الطبيب
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
 * @route /api/doctor/:id/patients
 * @desc View doctor patients
 * @access public 
 */
exports.getPatients = asyncHandler(async (req, res, next) => {
    const { id: doctorId } = req.params; // Get doctorId from URL parameter

    // 1. التحقق من وجود الطبيب
    const doctor = await Doctor.findByPk(doctorId, {
        attributes: ['firstName', 'lastName'] // Fetch only firstName, lastName
    });

    if (!doctor) {
        return next(new ApiError("Doctor not found", 404))
    }

    // 2. الحصول على قائمة المرضى المرتبطين بالطبيب
    const patients = await Patient.findAll({
        where: { doctorId }, // Filter by DoctorDoctorId
        attributes: ['patientId', 'firstName', 'lastName', 'img'] // Fetch only firstName, lastName, and img for patients
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
 * @route /api/doctor/:doctorId/patients/:patientId
 * @desc View patient profile for doctor
 * @access private (عشان لازم يكون في توكن صالح)
*/

// Display data patient for doctor
exports.getPatientProfile = asyncHandler(async (req, res, next) => {
    const { doctorId, patientId } = req.params; // Get doctorId and patientId from URL

    // 1. التحقق من وجود الطبيب
    const doctor = await Doctor.findByPk(doctorId, {
        attributes: ['firstName', 'lastName'] 
    });

    if (!doctor) {
        return next(new ApiError("Doctor not found", 404))

    }

    // 2. التحقق من وجود المريض المرتبط بالطبيب
    const patient = await Patient.findOne({
        where: {
            patientId: patientId,
            doctorId // تأكد أن المريض فعلاً يتبع الطبيب
        },
        attributes: ['patientId', 'firstName', 'lastName', 'img'] 
    });

    if (!patient) {
        return next(new ApiError("Patient not found for this doctor", 404));
    }

    // 3. إرسال بيانات الطبيب والمريض
    res.status(200).json({
        status: 'success',
        message: "Patient profile fetched successfully",
        data: {
            doctor,
            patient
        }
    });
});