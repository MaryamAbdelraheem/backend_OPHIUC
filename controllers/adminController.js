const ApiError = require('../utils/errors/ApiError');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const { Doctor } = require('../models'); // استيراد موديل الطبيب (في حالة استخدام قاعدة بيانات)

/**
 * @method GET
 * @route /api/admin/users/doctors
 * @desc View doctors for admin
 * @access private
 */
exports.viewDoctors = asyncHandler(async (req, res, next) => {
    const doctors = await Doctor.findAll({
        attributes: { exclude: ['password'] }
    });

    if (!doctors) {
        return next(new ApiError('No doctors found', 404));
    }

    res.status(200).json({
        status: 'success',
        message: 'Doctors fetched successfully',
        data: {
            doctors
        }
    });
});

/**
 * @method POST
 * @route /api/v1/admin/users/doctors
 * @desc Add doctor
 * @access Private (Admin)
 */
exports.addDoctor = asyncHandler(async (req, res, next) => {
    const { firstName, lastName, email, password, phoneNumber, specialization, gender } = req.body;

    // Make sure there is no doctor with the same email.
    const existingDoctor = await Doctor.findOne({ where: { email } });
    if (existingDoctor) {
        return next(new ApiError('Doctor with this email already exists', 400));
    }

    const hashedPassword = await bcrypt.hash(password.trim(), 10);

    const newDoctor = await Doctor.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        phoneNumber,
        specialization,
        gender
    });

    // Prepare data without password
    const { password: _, ...doctorData } = newDoctor.toJSON();

    res.status(201).json({
        status: 'success',
        message: "Doctor created successfully",
        data: {
            doctor: doctorData,
        }
    });
});


/**
 * @method DELETE
 * @route /api/admin/users/doctors/:id
 * @desc Delete doctor //soft delete, عشان اقدر ارجعه بسهولة لو احتجته
 * @access private
 */
exports.deleteDoctor = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    // Make sure the doctor is present
    const doctor = await Doctor.findByPk(id);

    if (!doctor) {
        return next(new ApiError("Doctor not found", 404));
    }

    // Delete doctor
    await doctor.destroy();

    res.status(200).json({
        status: "success",
        message: "Doctor deleted successfully",
    });
});
