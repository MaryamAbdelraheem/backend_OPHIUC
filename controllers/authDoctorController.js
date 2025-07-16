const ApiError = require('../utils/errors/ApiError');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const { Doctor } = require('../models'); // استيراد موديل الطبيب
const { generateToken } = require("../middleware/authMiddleware");


/**
 * @method POST
 * @route /api/doctor/login
 * @desc Login a doctor
 * @access Public
 */
exports.login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    // 1. التحقق من وجود الطبيب
    const doctor = await Doctor.findOne({ where: { email } });

    if (!doctor) {
        return next(new ApiError('Invalid credentials', 401));
    }

    // 2. التحقق من كلمة المرور
    const isPasswordValid = await bcrypt.compare(password, doctor.password);
    if (!isPasswordValid) {
        return next(new ApiError('Invalid credentials', 401));
    }

    // 3. إنشاء التوكن
    const token = generateToken(doctor, "doctor");

    // 4. إعداد البيانات المرسلة
    const { doctorId, firstName, lastName, phoneNumber, specialization, gender } = doctor;

    res.status(200).json({
        status: 'success',
        message: 'Login successful',
        data: {
            doctorId,
            firstName,
            lastName,
            email,
            phoneNumber,
            specialization,
            gender,
            token
        }
    });
});

const tokenBlacklist = new Set();
/**
 * @method POST
 * @route /api/doctor/logout
 * @desc logout a doctor
 * @access public 
 */

exports.logout = asyncHandler(async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next(new ApiError("No token provided", 401));
    }

    const token = authHeader.split(" ")[1];

    try {
        jwt.verify(token, SECRET_KEY);
    } catch (error) {
        return next(new ApiError("Invalid token", 401));
    }

    tokenBlacklist.add(token);

    res.status(200).json({
        status: 'successs',
        message: "Logout successful"
    });
});