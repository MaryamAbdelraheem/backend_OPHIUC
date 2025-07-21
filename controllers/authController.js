const ApiError = require('../utils/errors/ApiError');
const jwt = require("jsonwebtoken");
const redisClient = require('../config/redisClient');
const bcrypt = require("bcryptjs");
const asyncHandler = require('express-async-handler');
const { generateToken } = require("../middleware/authMiddleware");
const NotificationService = require('../services/NotificationService');
const { Doctor, Patient } = require('../models');
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const SECRET_KEY = process.env.JWT_SECRET || "ophiucs-project-secret-jwt";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

const STATIC_ADMIN = {
    id: 1,
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    role: "admin",
};

// Signup
exports.signupPatient = asyncHandler(async (req, res, next) => {
    const {
        firstName, lastName, email, password,
        height, weight, gender, age, doctorId
    } = req.body;

    const doctor = await Doctor.findByPk(doctorId);
    if (!doctor) return next(new ApiError("Invalid doctor ID", 400));

    const existingPatient = await Patient.findOne({ where: { email } });
    if (existingPatient) return next(new ApiError("Email already registered", 400));

    const hashedPassword = await bcrypt.hash(password, 10);

    const patient = await Patient.create({
        firstName, lastName, email, password: hashedPassword,
        height, weight, gender, age, doctorId
    });

    await NotificationService.send({
        type: 'GENERAL',
        recipient_id: patient.patientId,
        context_type: 'NONE',
        context_id: null,
        target_app: 'PATIENT_APP',
        delivery_method: 'IN_APP',
        patientId: patient.patientId,
        doctorId: doctorId || null,
        appointmentId: null
    });

    const token = generateToken(patient, "patient");
    res.status(201).json({
        status: 'success',
        message: "Account created",
        data: {
            patientId: patient.patientId,
            email: patient.email
        },
        token
    });
});

// Login
exports.login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    if (email === STATIC_ADMIN.email && password === STATIC_ADMIN.password) {
        const token = jwt.sign({ id: STATIC_ADMIN.id, email: STATIC_ADMIN.email, role: STATIC_ADMIN.role }, SECRET_KEY, { expiresIn: "1d" });
        return res.status(200).json({
            status: 'success',
            message: "Admin login successful",
            data: {
                id: STATIC_ADMIN.id,
                email: STATIC_ADMIN.email,
                role: STATIC_ADMIN.role
            },
            token
        });
    }

    const patient = await Patient.findOne({ where: { email } });
    if (patient && await bcrypt.compare(password, patient.password)) {
        const token = generateToken(patient, "patient");
        return res.status(200).json({
            status: 'success',
            message: "Patient login successful",
            data: {
                patientId: patient.patientId,
                email: patient.email,
                role: "patient"
            },
            token
        });
    }

    const doctor = await Doctor.findOne({ where: { email } });
    if (doctor && await bcrypt.compare(password, doctor.password)) {
        const token = generateToken(doctor, "doctor");
        return res.status(200).json({
            status: 'success',
            message: "Doctor login successful",
            data: {
                doctorId: doctor.doctorId,
                email: doctor.email,
                role: "doctor"
            },
            token
        });
    }

    return next(new ApiError("Invalid email or password", 401));
});

// Logout
exports.logout = asyncHandler(async (req, res, next) => {
    const token = req.token;
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) return next(new ApiError("Invalid token structure", 400));

    const expiryInSeconds = decoded.exp - Math.floor(Date.now() / 1000);
    await redisClient.set(`blacklist:${token}`, "true", "EX", expiryInSeconds);

    res.status(200).json({
        status: "success",
        message: "You have successfully logged out"
    });
});

// Forgot Password (Improved with Redis + Crypto)
// 1.توليد التوكن باستخدام crypto.randomBytes وهو أكثر أمانًا.
// 2.تخزين التوكن في Redis.
// 3.إرسال رابط إعادة التعيين(reset link) موجه للـ Frontend.
// حذف التوكن من.4  Redis بعد الاستخدام. 
exports.forgotPassword = asyncHandler(async (req, res, next) => {
    const { email } = req.body;
    const user = await Patient.findOne({ where: { email } }) || await Doctor.findOne({ where: { email } });
    if (!user) return next(new ApiError("User not found", 404));

    const token = crypto.randomBytes(32).toString("hex");
    const expiresInMinutes = 15;
    await redisClient.set(`reset:${token}`, email, "EX", expiresInMinutes * 60);

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Reset your password",
        html: `<p>You requested a password reset.</p><p><a href="${resetLink}">Click here to reset</a></p>`
    });

    res.status(200).json({
        status: "success",
        message: "Password reset link sent to email"
    });
});

// Reset Password (Improved)
exports.resetPassword = asyncHandler(async (req, res, next) => {
    const { token, newPassword } = req.body;
    const email = await redisClient.get(`reset:${token}`);
    if (!email) return next(new ApiError("Invalid or expired token", 400));

    const user = await Patient.findOne({ where: { email } }) || await Doctor.findOne({ where: { email } });
    if (!user) return next(new ApiError("User not found", 404));

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    await redisClient.del(`reset:${token}`);

    res.status(200).json({
        status: "success",
        message: "Password has been reset"
    });
});

// Change Password
exports.changePassword = asyncHandler(async (req, res, next) => {
    const { oldPassword, newPassword } = req.body;
    const user = req.user;

    if (!user || !(await bcrypt.compare(oldPassword, user.password))) {
        return next(new ApiError("Old password is incorrect", 400));
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({
        status: "success",
        message: "Password changed successfully"
    });
});
