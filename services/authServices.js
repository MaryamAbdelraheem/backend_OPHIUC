const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const ApiError = require('../utils/errors/ApiError');
const { generateToken } = require('../middleware/authMiddleware');
const NotificationService = require('./NotificationService');
const patientRepository = require('../repositories/patientRepository');
const doctorRepository = require('../repositories/doctorRepository');

const SECRET_KEY = process.env.JWT_SECRET || "ophiucs-project-secret-jwt";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

const STATIC_ADMIN = {
  id: 1,
  email: ADMIN_EMAIL,
  password: ADMIN_PASSWORD,
  role: "admin",
};

class AuthService {
  // Signup for Patient
  async signup(patientData) {
    const {
      firstName, lastName, email, password,
      height, weight, gender, age, doctorId
    } = patientData;

    // Check if doctor exists
    const doctor = await doctorRepository.findById(doctorId);
    if (!doctor) throw new ApiError("Invalid doctor ID", 400);

    // Check if email already exists
    const existing = await patientRepository.findByEmail(email);
    if (existing) throw new ApiError("Email already registered", 400);

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create patient
    const patient = await patientRepository.createPatient({
      firstName, lastName, email,
      password: hashedPassword,
      height, weight, gender, age, doctorId
    });

    // Send welcome notification
    await NotificationService.send({
      type: 'GENERAL',
      recipient_id: patient.patientId,
      context_type: 'NONE',
      context_id: null,
      target_app: 'PATIENT_APP',
      delivery_method: 'IN_APP',
      patientId: patient.patientId,
      doctorId: doctorId,
      appointmentId: null
    });

    // Generate token
    const token = generateToken(patient, "patient");

    return {
      patient: {
        patientId: patient.patientId,
        firstName: patient.firstName,
        lastName: patient.lastName,
        email: patient.email,
        height: patient.height,
        weight: patient.weight,
        gender: patient.gender,
        age: patient.age,
        doctorId: patient.doctorId
      },
      token
    };
  }

  // Login for Admin, Patient, Doctor
  async login({ email, password }) {
    // Static Admin
    if (email === STATIC_ADMIN.email && password === STATIC_ADMIN.password) {
      const token = jwt.sign(
        { id: STATIC_ADMIN.id, email: STATIC_ADMIN.email, role: STATIC_ADMIN.role },
        SECRET_KEY,
        { expiresIn: "1d" }
      );
      return {
        user: { id: STATIC_ADMIN.id, email: STATIC_ADMIN.email, role: STATIC_ADMIN.role },
        token
      };
    }

    // Patient Login
    const patient = await patientRepository.findByEmail(email);
    if (patient && await bcrypt.compare(password, patient.password)) {
      const token = generateToken(patient, "patient");
      return {
        user: {
          patientId: patient.patientId,
          email: patient.email,
          role: "patient"
        },
        token
      };
    }

    // Doctor Login
    const doctor = await doctorRepository.findDoctorByEmail(email);
    if (doctor && await bcrypt.compare(password, doctor.password)) {
      const token = generateToken(doctor, "doctor");
      return {
        user: {
          doctorId: doctor.doctorId,
          email: doctor.email,
          role: "doctor"
        },
        token
      };
    }

    throw new ApiError("Invalid email or password", 401);
  }

  // Optional: Handle static admin separately (if needed externally)
  handleStaticAdmin(email, password) {
    if (email === STATIC_ADMIN.email && password === STATIC_ADMIN.password) {
      const token = jwt.sign(
        { id: STATIC_ADMIN.id, email: STATIC_ADMIN.email, role: STATIC_ADMIN.role },
        SECRET_KEY,
        { expiresIn: "1d" }
      );
      return {
        user: { id: STATIC_ADMIN.id, email: STATIC_ADMIN.email, role: STATIC_ADMIN.role },
        token
      };
    }
    return null;
  }
}

module.exports = new AuthService();