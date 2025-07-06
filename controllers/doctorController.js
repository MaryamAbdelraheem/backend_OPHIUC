const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Doctor, Patient } = require('../models'); // Ensure Patient is imported
const { generateToken } = require("../middleware/authMiddleware");
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
        attributes: { exclude: ['email','password','createdAt','updatedAt','deletedAt'] } // استثناء كلمة السر من النتيجة
    });

    if (!doctor) {
        return res.status(404).json({ message: "Doctor not found" });
    }

    // 2. إرسال بيانات الطبيب
    res.status(200).json({
        message: "Doctor profile fetched successfully",
        doctor
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
        attributes: ['firstName', 'lastName'] // Fetch only firstName, lastName, and img
    });

    if (!doctor) {
        return res.status(404).json({ message: "Doctor not found" });
    }

    // 2. الحصول على قائمة المرضى المرتبطين بالطبيب
    const patients = await Patient.findAll({
        where: { DoctorDoctorId: doctorId }, // Filter by DoctorDoctorId
        attributes: ['patientId','firstName', 'lastName', 'img'] // Fetch only firstName, lastName, and img for patients
    });

    if (!patients || patients.length === 0) {
        return res.status(404).json({ message: "No patients found for this doctor" });
    }

    // 3. إرسال بيانات الطبيب و المرضى
    res.status(200).json({
        message: "Doctor's patients fetched successfully",
        doctor,
        patients
    });
});


/**
 * @method GET
 * @route /api/doctor/:doctorId/patients/:patientId
 * @desc View patient profile for doctor
 * @access private (عشان لازم يكون في توكن صالح)
*/

// عرض بيانات المريض للطبيب
exports.getPatientProfile = asyncHandler(async (req, res, next) => {
    const { doctorId, patientId } = req.params; // Get doctorId and patientId from URL

    // 1. التحقق من وجود الطبيب
    const doctor = await Doctor.findByPk(doctorId, {
        attributes: ['firstName', 'lastName'] // ممكن نجيب بيانات معينة فقط للطبيب
    });

    if (!doctor) {
        return res.status(404).json({ message: "Doctor not found" });
    }

    // 2. التحقق من وجود المريض المرتبط بالطبيب
    const patient = await Patient.findOne({
        where: {
            patientId: patientId,
            DoctorDoctorId: doctorId // تأكد أن المريض فعلاً يتبع الطبيب
        },
        attributes: ['patientId', 'firstName', 'lastName', 'img'] // نجيب بيانات محددة للمريض
    });

    if (!patient) {
        return res.status(404).json({ message: "Patient not found for this doctor" });
    }

    // 3. إرسال بيانات الطبيب والمريض
    res.status(200).json({
        message: "Patient profile fetched successfully",
        doctor,
        patient
    });
});