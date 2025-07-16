const ApiError = require('../utils/errors/ApiError');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { Patient, Doctor } = require("../models");
const asyncHandler = require('express-async-handler');
const { generateToken } = require("../middleware/authMiddleware");
const NotificationService = require('../services/NotificationService');


const SECRET_KEY = process.env.JWT_SECRET || "ophiucs-project-secret-jwt";


/**
 * @method POST
 * @route /api/patient/signup
 * @desc Signup a patient
 * @access public 
 */
exports.signup = asyncHandler(async (req, res, next) => {
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

    if (!firstName || !lastName || !email || !password || !height || !weight || !gender) {
        return next(new ApiError("All required fields must be provided", 400));
    }

    // Validate doctor exists
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

    // Check if email is already used
    const existingPatient = await Patient.findOne({ where: { email } });
    if (existingPatient) {
        return next(new ApiError("Email already registered", 400));
    }

    // Create new patient
    const patient = await Patient.create({
        firstName,
        lastName,
        email,
        password,
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

    // Generate token
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


// authPatientContrroler and doctorContrroler
/**
 * @method POST
 * @route /api/patient/login
 * @desc Login a patient
 * @access public 
 */

exports.login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    // Fetch patient from DB
    const patient = await Patient.findOne({ where: { email } });
    if (!patient) {
        return next(new ApiError("Invalid Credentials", 401));
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, patient.password);

    if (!isMatch) {
        return next(new ApiError("Invalid Credentials", 401));
    }

    // Generate JWT
    const token = generateToken(patient, "patient");

    res.status(200).json({
        status: 'success',
        message: "Login successfully",
        data: {

            patient_id: patient.patientId,
            first_name: patient.firstName,
            last_name: patient.lastName,
            email: patient.email,
            phone_number: patient.phoneNumber,
            medical_history: patient.medicalHistory,
            age: patient.age,
            height: patient.height,
            weight: patient.weight,
            gender: patient.gender,
            doctorId: patient.doctorId
        },
        token
    });
});


/**
 * @method POST
 * @route /api/patient/signup
 * @desc Logout a patient
 * @access public 
 */

exports.logout = asyncHandler(async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next(new ApiError("Unauthorized: No token provided", 401));
    }

    const token = authHeader.split(" ")[1];

    // Verify token before blacklisting
    try {
        jwt.verify(token, SECRET_KEY);
    } catch (error) {
        return next(new ApiError("Invalid token", 401));
    }

    // Store blacklisted tokens 
    const tokenBlacklist = new Set();
    // Add token to blacklist
    tokenBlacklist.add(token);

    res.status(200).json({
        status: 'success',
        message: "You have successfully logged out"
    });
});