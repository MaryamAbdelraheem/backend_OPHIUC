const ApiError = require('../utils/errors/ApiError');
const jwt = require("jsonwebtoken");
const redisClient = require('../config/redisClient');
const bcrypt = require("bcryptjs");
const asyncHandler = require('express-async-handler');
const { generateToken } = require("../middleware/authMiddleware");
const NotificationService = require('../services/NotificationService');
const { Doctor, Patient } = require('../models');

const SECRET_KEY = process.env.JWT_SECRET || "ophiucs-project-secret-jwt";

// بيانات الأدمن من .env
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

const STATIC_ADMIN = {
    id: 1,
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    role: "admin",
};


exports.signupPatient = asyncHandler(async (req, res, next) => {
    const {
        firstName,
        lastName,
        email,
        password,
        height,
        weight,
        gender,
        age,
        doctorId
    } = req.body;

    if (doctorId) {
        const doctor = await Doctor.findByPk(doctorId);
        if (!doctor) {
            return next(new ApiError("Invalid doctor ID", 400));
        }
    }

    const genderMap = {
        0: "Male",
        1: "Female"
    };

    const genderString = genderMap[gender];
    if (!genderString) {
        return next(new ApiError("Invalid gender value", 400));
    }

    const existingPatient = await Patient.findOne({ where: { email } });
    if (existingPatient) {
        return next(new ApiError("Email already registered", 400));
    }

    // ✅ تشفير كلمة المرور
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // ✅ إنشاء المريض بكلمة المرور المشفرة
    const patient = await Patient.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        height,
        weight,
        gender: genderString,
        age,
        doctorId
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
        message: "The account has been created successfully",
        data: {
            patientId: patient.patientId,
            firstName: patient.firstName,
            lastName: patient.lastName,
            email: patient.email,
            height: patient.height,
            weight: patient.weight,
            gender: patient.gender,
            age: patient.age,
            doctorId: doctorId
        },
        token
    });
});

/**
 * @method POST
 * @route /api/v1/auth/login
 * @desc Login  patient , doctor and admin
 * @access public 
 */
//
exports.login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new ApiError("Please provide email and password", 400));
    }

    // Check if Admin
    if (email === STATIC_ADMIN.email && password === STATIC_ADMIN.password) {
        const token = jwt.sign(
            {
                id: STATIC_ADMIN.id,
                email: STATIC_ADMIN.email,
                role: STATIC_ADMIN.role,
            },
            SECRET_KEY,
            { expiresIn: "1d" }
        );

        return res.status(200).json({
            status: 'success',
            message: "Admin login successful",
            data: {
                id: STATIC_ADMIN.id,
                email: STATIC_ADMIN.email,
                role: STATIC_ADMIN.role,
            },
            token,
        });
    }

    // Check if Patient
    const patient = await Patient.findOne({ where: { email } });
    if (patient && await bcrypt.compare(password, patient.password)) {
        const token = generateToken(patient, "patient");
        return res.status(200).json({
            status: 'success',
            message: "Patient login successful",
            data: {
                patientId: patient.patientId,
                email: patient.email,
                role: "patient",
            },
            token,
        });
    }

    // Check if Doctor
    const doctor = await Doctor.findOne({ where: { email } });
    if (doctor && await bcrypt.compare(password, doctor.password)) {
        const token = generateToken(doctor, "doctor");
        return res.status(200).json({
            status: 'success',
            message: "Doctor login successful",
            data: {
                doctorId: doctor.doctorId,
                email: doctor.email,
                role: "doctor",
            },
            token,
        });
    }

    return next(new ApiError("Invalid credentials", 401));
});


/**
 * @method POST
 * @route /api/v1/auth/logout
 * @desc Logout  patient and doctor
 * @access public 
 */
//logout -> patient and doctor
exports.logout = asyncHandler(async (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];

    // Verify token to get expiry
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) {
        return res.status(400).json({ message: "Invalid token structure" });
    }

    const expiryInSeconds = decoded.exp - Math.floor(Date.now() / 1000);

    // Blacklist the token in Redis with expiry time
    await redisClient.set(`blacklist:${token}`, "true", "EX", expiryInSeconds);

    res.status(200).json({
        status: "success",
        message: "You have successfully logged out",
    });
});