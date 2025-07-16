const ApiError = require('../utils/errors/ApiError');
const bcrypt = require("bcryptjs");
const { Patient } = require("../models");
const asyncHandler = require('express-async-handler');

/**
 * @method PUT
 * @route /api/patient/:id
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

    // 2. تحديث الحقول فقط إذا تم إرسالها
    if (firstName) patient.firstName = firstName;
    if (lastName) patient.lastName = lastName;
    if (email) patient.email = email;
    if (password) patient.password = password; // هيتعملها hash في الـ model hook
    if (height) patient.height = height;
    if (weight) patient.weight = weight;
    if (gender !== undefined) {
        const genderMap = { 0: "Male", 1: "Female" };
        const genderString = genderMap[gender];
        if (!genderString) {
            return res.status(400).json({ message: "Invalid gender value" });
        }
        patient.gender = genderString;
    }
    if (phoneNumber) patient.phoneNumber = phoneNumber;
    if (medicalHistory) patient.medicalHistory = medicalHistory;
    if (age) patient.age = age;
    if (img) patient.img = img;

    // 3. حفظ التحديثات
    await patient.save();

    // 4. إزالة الباسورد من الـ response
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
 * @route /api/patient/:id
 * @desc View patient profile
 * @access public 
 */
exports.getProfile = asyncHandler(async (req, res, next) => {
    const { id: patientId } = req.params;

    // 1. التحقق من وجود المريض
    const patient = await Patient.findByPk(patientId, {
        attributes: { exclude: ['password'] } // استثناء كلمة السر من النتيجة
    });

    if (!patient) {
        return next(new ApiError("Patient not found", 404))
    }

    // 2. إرسال بيانات المريض
    res.status(200).json({
        status: 'success',
        message: "Patient profile fetched successfully",
        data: {
            patient
        }
    });
});

