The following is a digest of the repository "backend_OPHIUC.git".
This digest is designed to be easily parsed by Large Language Models.

--- SUMMARY ---
Repository: backend_OPHIUC.git
Files Analyzed: 53
Total Size: 113.72 KB
Estimated Tokens: ~26,971

--- DIRECTORY STRUCTURE ---
backend_OPHIUC.git/
├── config/
├── database.js
├── firebase.js
├── redisClient.js
└── swagger.js
├── controllers/
├── adminController.js
├── aiController.js
├── appointmentController.js
├── authController.js
├── deviceController.js
├── doctorController.js
├── NotificationController.js
├── patientController.js
└── vitalsController.js
├── middleware/
├── authMiddleware.js
├── errorMiddleware.js
├── rateLimiter.js
├── socketAuth.js
└── validateRequest.js
├── models/
├── appointmentModel.js
├── associationsModel.js
├── deviceModel.js
├── doctorModel.js
├── index.js
├── notificationModel.js
├── patientModel.js
└── vitalsModel.js
├── repositories/
└── patientRepository.js
├── routes/
├── adminRoute.js
├── appointmentRoute.js
├── authRoute.js
├── deviceRoute.js
├── doctorRoute.js
├── notificationRoute.js
├── patientRoute.js
└── vitalsRoute.js
├── services/
├── aiService.js
├── firebaseVitalsService.js
└── NotificationService.js
├── socket/
├── index.js
└── notificationSocket.js
├── tasks/
└── flushBufferedVitals.js
├── utils/
├── errors/
│   └── ApiError.js
├── calcAverage.js
├── genderMap.js
└── notificationTemplates.js
├── validators/
├── adminValidator.js
├── appointmentValidator.js
├── authValidator.js
├── doctorValidator.js
└── patientValidator.js
├── app.js
├── Docs.md
├── package.json
├── README.md


--- FILE CONTENTS ---
============================================================
FILE: config/database.js
============================================================
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USERNAME,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: process.env.DB_DIALECT,
        logging: false, // Close logs MySQL
        dialectOptions: {
            connectTimeout: 10000,
        },
    }
);

module.exports = sequelize;


============================================================
FILE: config/firebase.js
============================================================
const admin = require("firebase-admin");

const serviceAccount = require("./osahealthmonitor-firebase-adminsdk-fbsvc-f42e920593.json");

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://osahealthmonitor-default-rtdb.firebaseio.com",
    });
}

module.exports = admin.database();


============================================================
FILE: config/redisClient.js
============================================================
const redis = require('redis');
require('dotenv').config();

const redisClient = redis.createClient({
    url: process.env.REDIS_URL // مثال: redis://localhost:6379
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

(async () => {
    try {
        await redisClient.connect();
        console.log('Connected to Redis');
    } catch (err) {
        console.error('Failed to connect to Redis:', err);
    }
})();

module.exports = redisClient;

============================================================
FILE: config/swagger.js
============================================================
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Swagger Options
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Ophiuchus Health Monitoring API',
            version: '1.0.0',
            description: 'Backend API documentation for Ophiuchus Health Monitoring system',
        },
        servers: [
            {
                url: 'http://localhost:4000/api/v1',
                description: 'Local development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ['./routes/**/*.js'], // Swagger comments path (adjust if needed)
};

// Swagger Spec Generator
const swaggerSpec = swaggerJSDoc(options);

module.exports = {
    swaggerUi,
    swaggerSpec,
};


============================================================
FILE: controllers/adminController.js
============================================================
const ApiError = require('../utils/errors/ApiError');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const { Doctor } = require('../models');

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

    if (doctors.length === 0) {
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


============================================================
FILE: controllers/aiController.js
============================================================
const databaseFire = require('../config/firebase'); // استدعاء Firebase Realtime DB
const redisClient = require("../config/redisClient");
const ApiError = require('../utils/errors/ApiError');
const aiService = require("../services/aiService");
const asyncHandler = require("express-async-handler");

exports.handlePrediction = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  const result = await aiService.predictSleepApnea(req.body, token);

  if (!result) {
    return next(new ApiError("Prediction failed or no result returned", 400));
  }

  if (!databaseFire) {
    return next(new ApiError("Firebase database not initialized", 500));
  }

  const patientId = req.user.id || "unknown";
  const redisKey = `severe_count:${patientId}`;

  if (result.prediction === "Severe") {
    // زود العداد في Redis
    const currentCount = await redisClient.incr(redisKey);

    // خلي العداد ينتهي بعد 15 دقيقة (optional)
    if (currentCount === 1) {
      await redisClient.expire(redisKey, 900); // 15 دقيقة = 900 ثانية
    }

    // لما نوصل لـ 5 مرات متتالية
    if (currentCount >= 5) {
      const alertRef = databaseFire.ref('alerts').push();
      await alertRef.set({
        timestamp: new Date().toISOString(),
        message: "Severe sleep apnea detected 5 times in a row",
        patientId: patientId,
        severity: 5,
        prediction: result.prediction
      });

      console.log("Alert pushed to Firebase after 5 severe detections");

      // تصفير العداد بعد إرسال التنبيه
      await redisClient.del(redisKey);
    } else {
      console.log(`Severe detected ${currentCount}/5 for patient ${patientId}`);
    }
  } else {
    // لو الحالة مش شديدة، نصفر العداد
    await redisClient.del(redisKey);
  }

  res.status(200).json({
    status: "success",
    data: {
      result
    }
  });
});

exports.handleTreatment = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  const result = await aiService.getTreatmentPlan(req.body, token);

  if (!result) {
    return next(new ApiError('No treatment plan found', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Treatment plan retrieved successfully',
    data: {
      result
    }
  });
});

exports.handleReport = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  const result = await aiService.getReport(req.body, token);

  if (!result) {
    return next(new ApiError('No report found', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Report generated successfully',
    data: {
      result
    }
  });
});

exports.handleFullReport = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  const result = await aiService.getFullReport(req.body, token);

  if (!result) {
    return next(new ApiError('No full report found', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Full report generated successfully',
    data: {
      result
    }
  });
});


============================================================
FILE: controllers/appointmentController.js
============================================================
const ApiError = require('../utils/errors/ApiError');
const { Appointment, Notification, Patient, Doctor } = require("../models");
const asyncHandler = require("express-async-handler");
/**
 * @desc Create an appointment for the doctor's patient 
 * @route POST /api/v1/appointments
 * @access private (doctors)
 */
exports.createAppointment = asyncHandler(async (req, res, next) => {
  const doctorId = req.user.id; // From token
  const { patient_id, appointment_date, } = req.body;

  // Check if the patient exists
  const patient = await Patient.findByPk(patient_id);
  if (!patient) {
    return next(new ApiError("Patient not found", 404));
  }

  // Create Appointment
  const appointment = await Appointment.create({
    doctorId: doctorId,
    patientId: patient_id,
    appointment_date,
  });
  res.status(201).json({
    status: "success",
    message: "Appointment created successfully",
    data: {
      appointment
    }
  });
});

/**
 * @desc Get all appointments with doctor name, specialty, date and time
 * @route GET /api/v1/appointments
 * @access private (for authenticated users like doctors or patients)
 */

exports.getAllAppointmentsWithDoctorInfo = asyncHandler(async (req, res, next) => {
  const patientId = req.user.id; //Extract from token

  const appointments = await Appointment.findAll({
    where: { patientId: patientId },
    include: [
      {
        model: Doctor,
        attributes: ['firstName', 'lastName', 'specialization']
      }
    ],
    attributes: ['appointment_date'],
    order: [['appointment_date', 'ASC']],
  });

  if (!appointments || appointments.length === 0) {
    return next(new ApiError("No appointments found for this patient", 404));
  }

  const formattedAppointments = appointments.map(app => ({
    doctorName: `Dr. ${app.Doctor.firstName} ${app.Doctor.lastName}`,
    specialization: app.Doctor.specialization,
    date: app.appointment_date.toISOString().split('T')[0],
    time: app.appointment_date.toISOString().split('T')[1].slice(0, 5),
  }));

  res.status(200).json({
    status: "success",
    data: {
      appointments: formattedAppointments
    }
  });
});


============================================================
FILE: controllers/authController.js
============================================================
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


============================================================
FILE: controllers/deviceController.js
============================================================
const ApiError = require('../utils/errors/ApiError');
const asyncHandler = require('express-async-handler');
const { Device } = require('../models');

/**
 * @route POST /api/v1/devices/bind
 * @desc Bind scanned device (via QR code) to the logged-in patient
 */
exports.bindDeviceToPatient = asyncHandler(async (req, res, next) => {
    const { serialNumber, model } = req.body;
    const patientId = req.user.id;

    if (!serialNumber) {
        return next(new ApiError("serialNumber is required", 400));
    }

    // Try to find existing device
    let device = await Device.findOne({ where: { serialNumber } });

    // If not found, create it
    if (!device) {
        if (!model) {
            return next(new ApiError("Device not found. Please include device model to register it.", 400));
        }

        device = await Device.create({
            serialNumber,
            model,
            isAssigned: true,
            patientId,
        });

        return res.status(201).json({
            status: "success",
            message: "Device registered and assigned to patient successfully",
            data: {
                device
            },
        });
    }

    // If already assigned
    if (device.isAssigned) {
        return next(new ApiError("Device is already assigned", 400));
    }

    // Assign to current patient
    device.patientId = patientId;
    device.isAssigned = true;
    await device.save();

    res.status(200).json({
        status: "success",
        message: "Device assigned to patient successfully",
        data: { device },
    });
});


============================================================
FILE: controllers/doctorController.js
============================================================
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

============================================================
FILE: controllers/NotificationController.js
============================================================
const ApiError = require('../utils/errors/ApiError');
const { Notification } = require('../models');
const NotificationService = require('../services/NotificationService');
const asyncHandler = require('express-async-handler')
/**
 * @method POST
 * @route /api/v1/notifications
 * @desc Create automatic system notification
 * @access protected (token required)
 */
exports.createNotification = asyncHandler(async (req, res) => {

  const notification = await NotificationService.send(req.body);
  res.status(201).json({
    status: "success",
    data: {
      notification
    }
  });

});

/**
 * @method GET
 * @route /api/v1/notifications
 * @desc Get current user's notifications
 * @access Protected (token required)
 */
exports.getMyNotifications = asyncHandler(async (req, res) => {
  const userId  = req.user.id; // Extracted from auth middleware
  
  const notifications = await Notification.findAll({
    where: { recipient_id: userId },
    order: [['createdAt', 'DESC']]
  });

  res.status(200).json({
    status: 'success',
    data: {
      notifications
    }
  });
});

/**
 * @method GET
 * @route /api/notifications/:id
 * @desc Get current user's notification by id
 * @access protected (token required)
 */
exports.getNotificationById = asyncHandler(async (req, res, next) => {
  const notificationId = req.params.id;
  const userId = req.user.id; // تأكد إن المستخدم هو اللي له الإشعار

  const notification = await Notification.findOne({
    where: {
      notification_id: notificationId,
      recipient_id: userId  // عشان الأمان
    }
  });

  if (!notification) {
    return next(new ApiError('Notification not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      notification
    }
  });
});




/**
 * @method PATCH
 * @route /api/v1/notifications/:id/seen
 * @desc Mark a notification as seen
 * @access protected (token required)
 */
exports.markAsSeen = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const notification = await Notification.findByPk(id);

  if (!notification) {
    return next(new ApiError('Notification not found', 404));
  }

  notification.seen = true;
  await notification.save();

  res.status(200).json({
    status: 'success',
    message: 'Notification marked as seen'
  });
});

/**
 * @method POST
 * @route /api/v1/notifications/general
 * @desc Send a general notification (e.g. greeting, system message)
 * @access protected (token required)
 */
exports.sendGeneral = asyncHandler(async (req, res) => {
  const { recipient_id, type = 'GREETING', target_app } = req.body;

  const notification = await NotificationService.send({
    type,
    recipient_id,
    context_type: 'NONE',
    context_id: null,
    target_app
  });

  res.status(201).json({
    status: 'success',
    data: {
      notification
    }
  });
});

============================================================
FILE: controllers/patientController.js
============================================================
const ApiError = require('../utils/errors/ApiError');
const bcrypt = require("bcryptjs");
const { Patient } = require("../models");
const asyncHandler = require('express-async-handler');

/**
 * @method PUT
 * @route /api/v1/patients/:id
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

    if (req.user.id !== Number(patientId)) {
        return next(new ApiError("Unauthorized access", 403));
    }

    const patient = await Patient.findByPk(patientId);
    if (!patient) {
        return next(new ApiError("Patient not found", 404));
    }

    const fieldsToUpdate = {
        firstName,
        lastName,
        email,
        phoneNumber,
        medicalHistory,
        age,
        height,
        weight,
        gender,
        img
    };

    for (const key in fieldsToUpdate) {
        if (fieldsToUpdate[key] !== undefined) {
            patient[key] = fieldsToUpdate[key];
        }
    }

    if (password) {
        const salt = await bcrypt.genSalt(10);
        patient.password = await bcrypt.hash(password, salt);
    }

    await patient.save();

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
 * @route /api/v1/patients/:id
 * @desc View patient profile
 * @access public 
 */
exports.getProfile = asyncHandler(async (req, res, next) => {
    const { id: patientId } = req.params;
    const patient = await Patient.findByPk(patientId, {
        attributes: { exclude: ['password'] }
    });

    if (!patient) {
        return next(new ApiError("Patient not found", 404))
    }

    res.status(200).json({
        status: 'success',
        message: "Patient profile fetched successfully",
        data: {
            patient
        }
    });
});



============================================================
FILE: controllers/vitalsController.js
============================================================
const asyncHandler = require('express-async-handler');
const { Op } = require('sequelize');
const db = require("../config/firebase");
const { Vitals, Device } = require('../models');
/**
 * @desc Listen to Firebase Realtime Database and save vitals + emit via WebSocket
 */
exports.listenToFirebaseVitals = () => {
  const vitalsRef = db.ref("vitals"); // المسار في Firebase

  vitalsRef.on("child_added", async (snapshot) => {
    const data = snapshot.val();

    try {
      const { serialNumber, ...averageVitals } = data;

      if (!serialNumber) return console.error("Missing serialNumber");

      // 1. Fetch the device
      const device = await Device.findOne({ where: { serialNumber } });
      if (!device || !device.patientId) {
        return console.error("Device not linked or not found");
      }

      // 2. Save vitals
      const vitals = await Vitals.create({
        patientId: device.patientId,
        deviceId: device.deviceId,
        ...averageVitals,
        source: "device",
      });

      // 3. Emit via WebSocket
      if (global.io) {
        global.io.emit("newVitals", {
          patientId: device.patientId,
          vitals,
        });
      }

      console.log("Vitals saved and emitted:", vitals.id);
    } catch (error) {
      console.error("Error saving vitals:", error.message);
    }
  });
};

/**
 * @desc Retrieves the latest vitals averaged and stored from Redis within the last 30 minutes.
 *       This endpoint is intended to display the most recent processed device data for monitoring.
 * @route GET /api/v1/vitals/last-averaged
 * @access private (patient)
 * @returns {Object} 200 - JSON response containing an array of vitals records
 */

exports.getLastAveragedVitals = asyncHandler(async (req, res) => {
  const THIRTY_MINUTES_AGO = new Date(Date.now() - 30 * 60 * 1000);

  const vitals = await Vitals.findAll({
    where: {
      createdAt: {
        [Op.gte]: THIRTY_MINUTES_AGO
      }
    },
    attributes: [
      'patientId',
      'deviceId',
      'Oxygen_Saturation',
      'Snoring',
      'AHI',
      'BMI',
      'Age',
      'Gender',
      'createdAt'
    ],
    order: [['createdAt', 'DESC']]
  });

  res.status(200).json({
    status: 'success',
    results: vitals.length,
    data: {
      vitals
    }
  });
});


============================================================
FILE: middleware/authMiddleware.js
============================================================
const ApiError = require('../utils/errors/ApiError');
const jwt = require("jsonwebtoken");
const redisClient = require("../config/redisClient");

const SECRET_KEY = process.env.SECRET_KEY || "ophiucs-project-secret-jwt"; // Use env variable

// Middleware to protect routes
async function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return next(new ApiError("Unauthorized: No token provided", 401));
  }

  // Check if token is blacklisted in Redis
  try {
    const isBlacklisted = await redisClient.get(`blacklist:${token}`);
    if (isBlacklisted) {
      return next(new ApiError("Token has been revoked", 401));
    }
  } catch (err) {
    console.error("Redis error:", err);
    return next(new ApiError("Internal server error", 500));
  }

  // Verify token
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return next(new ApiError("Forbidden: Invalid token", 403));
    }

    req.user = decoded; // Attach user info to request
    req.token = token;
    next();
  });
}

// Role-based access control middleware
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError("Unauthorized: No user found", 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new ApiError(`Forbidden: Access denied. Required role: ${allowedRoles.join(", ")}`, 403));
    }

    next();
  };
}

// Generate JWT token with role
function generateToken(user, role) {
  const userId = user.id ?? user.doctorId ?? user.patientId;
  const payload = {
    id: userId,
    email: user.email,
    role,
  };

  return jwt.sign(payload, SECRET_KEY, { expiresIn: "12h" });
}



module.exports = { authenticateToken, generateToken, authorizeRoles };

============================================================
FILE: middleware/errorMiddleware.js
============================================================
const { ValidationError, UniqueConstraintError, DatabaseError } = require('sequelize');
const ApiError = require('../utils/errors/ApiError');

// Handle Sequelize Validation Error
const handleSequelizeValidationError = (err) => {
    const messages = err.errors.map((e) => e.message);
    return new ApiError(`Validation error: ${messages.join(', ')}`, 400);
};

// Handle Sequelize Unique Constraint Error
const handleSequelizeUniqueError = (err) => {
    const messages = err.errors.map((e) => `${e.path} must be unique`);
    return new ApiError(`Duplicate field: ${messages.join(', ')}`, 400);
};

// Handle Sequelize Database Error
const handleSequelizeDatabaseError = (err) => {
    return new ApiError('Database error occurred', 500);
};

// Dev mode error response
const sendErrorDev = (err, res) => {
    res.status(err.statusCode || 500).json({
        status: err.status || 'error',
        message: err.message,
        error: err,
        stack: err.stack
    });
};

// Production mode error response
const sendErrorProd = (err, res) => {
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    } else {
        console.error('ERROR ', err);
        res.status(500).json({
            status: 'error',
            message: 'Something went wrong!'
        });
    }
};

// Global Error Handler
exports.globalErrorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    let error = err;

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(error, res);
    } else if (process.env.NODE_ENV === 'production') {
        if (err instanceof ValidationError) error = handleSequelizeValidationError(err);
        if (err instanceof UniqueConstraintError) error = handleSequelizeUniqueError(err);
        if (err instanceof DatabaseError) error = handleSequelizeDatabaseError(err);

        sendErrorProd(error, res);
    }
};

// Not found handler
exports.notFoundHandler = (req, res, next) => {
    next(new ApiError(`Can't find the requested URL: ${req.originalUrl}`, 404));
};

============================================================
FILE: middleware/rateLimiter.js
============================================================
const rateLimit = require("express-rate-limit");

exports.vitalsRateLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // كل 30 دقيقة
  max: 5, // max 5 requests
  message: "Too many vitals submissions. Please wait.",
});

// Forgot Password Rate Limiter
exports.forgotPasswordLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 دقائق
  max: 3, // أقصى عدد محاولات في الـ window
  message: {
    status: "fail",
    message: "Too many password reset requests, please try again later.",
  },
});


============================================================
FILE: middleware/socketAuth.js
============================================================
const jwt = require('jsonwebtoken');

const socketAuth = (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error("Unauthorized: Token missing"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    next(new Error("Unauthorized: Invalid token"));
  }
};

module.exports = socketAuth;

============================================================
FILE: middleware/validateRequest.js
============================================================
const { validationResult } = require('express-validator');

exports.validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }
    next();
};



============================================================
FILE: models/appointmentModel.js
============================================================
module.exports = (sequelize, DataTypes) => {
  const Appointment = sequelize.define('Appointment', {
    appointment_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    appointment_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    doctorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    patientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    }
  }, {
    timestamps: true
  });

  Appointment.afterCreate(async (appointment, options) => {
    const NotificationService = require('../services/NotificationService');

    await NotificationService.send({
      type: 'APPOINTMENT',
      recipient_id: appointment.patientId,
      context_type: 'APPOINTMENT',
      context_id: appointment.appointment_id,
      target_app: 'PATIENT_APP',
      delivery_method: 'IN_APP',
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      appointmentId: appointment.appointment_id
    });
  });

  return Appointment;
};


============================================================
FILE: models/associationsModel.js
============================================================
// في associations.js
const { Doctor, Patient, Appointment, Notification, Vitals, Device } = require('.');

// 1 To M with Doctor => Patient
Doctor.hasMany(Patient, { foreignKey: 'doctorId' });
Patient.belongsTo(Doctor, { foreignKey: 'doctorId' });

// 1 To M Patient => Appointment
Patient.hasMany(Appointment, { foreignKey: 'patientId' });
Appointment.belongsTo(Patient, { foreignKey: 'patientId' });

// 1 To M Doctor => Appointment
Doctor.hasMany(Appointment, { foreignKey: 'doctorId' });
Appointment.belongsTo(Doctor, { foreignKey: 'doctorId' });

// 1 To M Patient => Notification
Patient.hasMany(Notification, { foreignKey: 'patientId' });
Notification.belongsTo(Patient, { foreignKey: 'patientId' });

// 1 To M Doctor => Notification
Doctor.hasMany(Notification, { foreignKey: 'doctorId' });
Notification.belongsTo(Doctor, { foreignKey: 'doctorId' });

// 1 To M Appointment => Notification
Appointment.hasMany(Notification, { foreignKey: 'appointmentId' });
Notification.belongsTo(Appointment, { foreignKey: 'appointmentId' });

// Device belongs to Patient
Patient.hasMany(Device, { foreignKey: 'patientId' });
Device.belongsTo(Patient, { foreignKey: 'patientId' });

// Vitals belongs to Patient
Patient.hasMany(Vitals, { foreignKey: 'patientId' });
Vitals.belongsTo(Patient, { foreignKey: 'patientId' });

// Vitals belongs to Doctor
Doctor.hasMany(Vitals, { foreignKey: 'doctorId' });
Vitals.belongsTo(Doctor, { foreignKey: 'doctorId' });

// Vitals belongs to Device
Device.hasMany(Vitals, { foreignKey: 'deviceId' });
Vitals.belongsTo(Device, { foreignKey: 'deviceId' });

module.exports = { Doctor, Patient, Appointment, Notification, Vitals, Device };

============================================================
FILE: models/deviceModel.js
============================================================
module.exports = (sequelize, DataTypes) => {
  const Device = sequelize.define("Device", {
    deviceId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    serialNumber: { // QR Code
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    model: {
      type: DataTypes.STRING,
    },
    isAssigned: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  });
  return Device;
};


============================================================
FILE: models/doctorModel.js
============================================================
module.exports = (sequelize, DataTypes) => {
    const Doctor = sequelize.define('Doctor', {
        doctorId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        firstName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [8, 100]
            }
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        phoneNumber: {
            type: DataTypes.STRING,
            allowNull: false
        },
        specialization: {
            type: DataTypes.STRING,
            allowNull: false
        },
        gender: {
            type: DataTypes.ENUM('Male', 'Female'),
            allowNull: false
        }

    }, {
        timestamps: true,
        paranoid: true,
        tableName: 'doctors'
    });


    return Doctor;
};

============================================================
FILE: models/index.js
============================================================
//  تقوم باستدعاء associations.js لتهيئة العلاقات بعد تحميل
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Doctor = require('./doctorModel')(sequelize, DataTypes);
const Patient = require('./patientModel')(sequelize, DataTypes);
const Appointment = require('./appointmentModel')(sequelize, DataTypes);
const Notification = require('./notificationModel')(sequelize, DataTypes);
const Vitals = require('./vitalsModel')(sequelize, DataTypes);
const Device = require('./deviceModel')(sequelize, DataTypes);

// Import associations
require('./associationsModel');

module.exports = { Doctor, Patient, Appointment, Notification, Vitals, Device };

============================================================
FILE: models/notificationModel.js
============================================================
module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define('Notification', {
    notification_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    title: {
      type: DataTypes.STRING,
      allowNull: true
    },

    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },

    // نوع الإشعار:
    // 'GENERAL'       -> إشعارات عامة
    // 'HEALTH_ALERT'  -> إنذارات صحية
    // 'APPOINTMENT'   -> مواعيد
    // 'REMINDER'      -> تذكير
    // 'SYSTEM'        -> إشعارات تقنية
    // 'OTHER'         -> أي شيء آخر
    type: {
      type: DataTypes.ENUM(
        'GENERAL',
        'HEALTH_ALERT',
        'APPOINTMENT',
        'REMINDER',
        'SYSTEM',
        'OTHER'
      ),
      allowNull: false
    },

    // السياق المرتبط بالإشعار:
    // 'DEVICE'      -> الجهاز
    // 'APPOINTMENT' -> موعد
    // 'TEST'        -> تحليل
    // 'NONE'        -> لا يوجد سياق مباشر
    context_type: {
      type: DataTypes.ENUM('DEVICE', 'APPOINTMENT', 'TEST', 'NONE'),
      allowNull: true
    },

    context_id: {
      type: DataTypes.STRING(36), // يدعم UUID أو INT
      allowNull: true
    },

    recipient_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    sender_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },

    seen: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },

    scheduled_at: {
      type: DataTypes.DATE,
      allowNull: true
    },

    // أولوية الإشعار: منخفضة / متوسطة / عالية / حرجة
    priority: {
      type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'),
      defaultValue: 'MEDIUM'
    },

    // التطبيق المستهدف
    target_app: {
      type: DataTypes.ENUM('PATIENT_APP', 'DOCTOR_APP', 'BOTH'),
      defaultValue: 'BOTH'
    },

    // وسيلة الإرسال: داخل التطبيق، إيميل، SMS، إلخ
    delivery_method: {
      type: DataTypes.ENUM('IN_APP', 'EMAIL', 'SMS', 'PUSH'),
      defaultValue: 'IN_APP'
    },
  }, {
    timestamps: true
  });

  return Notification;
};



============================================================
FILE: models/patientModel.js
============================================================
module.exports = (sequelize, DataTypes) => {
  const Patient = sequelize.define('Patient', {
    patientId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [8, 100]
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    medicalHistory: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    height: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    weight: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    img: {
      type: DataTypes.STRING,
      allowNull: true
    },
    gender: {
      type: DataTypes.ENUM('Male', 'Female'),
      allowNull: true
    }
  }, {
    timestamps: true,
    paranoid: true,
    tableName: 'patients'
  });

  return Patient;
};

============================================================
FILE: models/vitalsModel.js
============================================================
module.exports = (sequelize, DataTypes) => {
    const Vitals = sequelize.define('Vitals', {
        VitalsId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        Age: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        Gender: {
            type: DataTypes.ENUM('Male', 'Female'),
            allowNull: false
        },
        BMI: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        Snoring: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        Oxygen_Saturation: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        AHI: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        ECG_Heart_Rate: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        Nasal_Airflow: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        Chest_Movement: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        EEG_Sleep_Stage: {
            type: DataTypes.STRING,
            allowNull: false
        },
        Diagnosis: {
            type: DataTypes.STRING,
            allowNull: true
        },
        // FK
        patientId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        doctorId: {
            type: DataTypes.INTEGER,
            allowNull: true, // يمكن يكون null لو لسه لم يُراجع من طبيب
        },
        deviceId: {
            type: DataTypes.INTEGER,
            allowNull: true, // يمكن يكون null لو مفيش جهاز محدد
        }
    }, {
        timestamps: true,
        paranoid: true,
        tableName: 'vitals'
    });

    return Vitals;
};


============================================================
FILE: repositories/patientRepository.js
============================================================
// Dealing with the database


============================================================
FILE: routes/adminRoute.js
============================================================
const express = require('express');
const router = express.Router();
const { viewDoctors, addDoctor, deleteDoctor } = require('../controllers/adminController');
const { addDoctorValidator, deleteDoctorValidator } = require('../validators/adminValidator');
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin management routes
 */

/**
 * @swagger
 * /admin/dashboard:
 *   get:
 *     summary: Get admin dashboard
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Welcome message with user info
 *       401:
 *         description: Unauthorized
 */
router
    .route("/dashboard")
    .get(
        authenticateToken,
        authorizeRoles('admin'),
        (req, res) => {
            res.json({ message: "Welcome to the dashboard", user: req.user });
        }
    )

/**
 * @swagger
 * /admin/users/doctors:
 *   get:
 *     summary: Get list of all doctors
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of doctors
 *       401:
 *         description: Unauthorized
 *   post:
 *     summary: Add a new doctor
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *               - specialty
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               specialty:
 *                 type: string
 *     responses:
 *       201:
 *         description: Doctor created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router
    .route('/users/doctors')
    .get(
        authenticateToken,
        authorizeRoles('admin'),
        viewDoctors
    )
    .post(
        authenticateToken,
        authorizeRoles('admin'),
        addDoctorValidator,
        addDoctor
    )

/**
 * @swagger
 * /admin/users/doctors/{id}:
 *   delete:
 *     summary: Delete a doctor by ID
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Doctor ID
 *     responses:
 *       200:
 *         description: Doctor deleted successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Doctor not found
 */
router
    .route('/users/doctors/:id')
    .delete(
        authenticateToken,
        authorizeRoles('admin'),
        deleteDoctorValidator,
        deleteDoctor
    )

module.exports = router;


// const express = require('express');
// const router = express.Router();
// const { viewDoctors, addDoctor, deleteDoctor } = require('../controllers/adminController');
// const { addDoctorValidator, deleteDoctorValidator } = require('../validators/adminValidator');
// const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");


// /**
//  * @route GET /api/v1/admin/dashboard
//  * @access protected
//  */
// router
//     .route("/dashboard")
//     .get(
//         authenticateToken,
//         authorizeRoles('admin'),
//         (req, res) => {
//             res.json({ message: "Welcome to the dashboard", user: req.user });
//         }
//     )

// /**
//  * @route GET, POST /api/v1/admin/users/doctors
//  * @access protected
//  */
// router
//     .route('/users/doctors')
//     .get(
//         authenticateToken,
//         authorizeRoles('admin'),
//         viewDoctors
//     )
//     .post(
//         authenticateToken,
//         authorizeRoles('admin'),
//         addDoctorValidator,
//         addDoctor
//     )

// /**
//  * @route DELETE /api/v1/admin/users/doctors/:id
//  * @access protected
//  */
// router
//     .route('/users/doctors/:id')
//     .delete(
//         authenticateToken,
//         authorizeRoles('admin'),
//         deleteDoctorValidator,
//         deleteDoctor
//     )


// module.exports = router;

============================================================
FILE: routes/appointmentRoute.js
============================================================
const express = require('express');
const router = express.Router();
const { createAppointmentValidator } = require('../validators/appointmentValidator');
const { createAppointment, getAllAppointmentsWithDoctorInfo } = require('../controllers/appointmentController');
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");

/**
 * @swagger
 * /appointments:
 *   post:
 *     summary: Create a new appointment
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patient_id
 *               - appointment_date
 *             properties:
 *               patient_id:
 *                 type: integer
 *                 example: 3
 *               appointment_date:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-07-22T10:30:00"
 *     responses:
 *       201:
 *         description: Appointment created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (only doctors can create)
 *
 *   get:
 *     summary: Get all appointments for the authenticated user
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of appointments with doctor info
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   appointmentId:
 *                     type: integer
 *                   doctorName:
 *                     type: string
 *                   specialty:
 *                     type: string
 *                   date:
 *                     type: string
 *                   time:
 *                     type: string
 *       401:
 *         description: Unauthorized
 */
router
    .route('/')
    .post(
        authenticateToken,
        authorizeRoles('doctor'),
        createAppointmentValidator,
        createAppointment
    )
    .get(
        authenticateToken,
        authorizeRoles('doctor', 'patient'),
        getAllAppointmentsWithDoctorInfo
    );

module.exports = router;


// const express = require('express');
// const router = express.Router();
// const { createAppointmentValidator } = require('../validators/appointmentValidator');
// const { createAppointment, getAllAppointmentsWithDoctorInfo } = require('../controllers/appointmentController');
// const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");
// /**
//  * @route GET, POST /api/v1/appointments
//  * @access private
//  */

// router
//     .route('/')
//     .post(
//         authenticateToken,
//         authorizeRoles('doctor'),
//         createAppointmentValidator,
//         createAppointment
//     )
//     .get(
//         authenticateToken,
//         authorizeRoles('doctor', 'patient'),
//         getAllAppointmentsWithDoctorInfo
//     );

// module.exports = router;

============================================================
FILE: routes/authRoute.js
============================================================
const express = require('express');
const router = express.Router();
const { signupPatientValidator, loginValidator } = require('../validators/authValidator');
const { signupPatient, login, logout, forgotPassword, resetPassword, changePassword } = require('../controllers/authController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const { forgotPasswordLimiter } = require('../middleware/rateLimiter');
/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication routes
 */

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Signup as a new patient
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *               - age
 *               - gender
 *               - height
 *               - weight
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               age:
 *                 type: integer
 *               gender:
 *                 type: string
 *                 enum: [male, female]
 *               height:
 *                 type: number
 *               weight:
 *                 type: number
 *               doctorId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Patient registered successfully
 *       400:
 *         description: Validation error
 */
router
    .route('/signup')
    .post(
        signupPatientValidator,
        signupPatient
    );

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login as a patient or doctor
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logged in successfully
 *       400:
 *         description: Invalid credentials
 */
router
    .route('/login')
    .post(
        loginValidator,
        login
    );

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout the currently logged-in user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       401:
 *         description: Unauthorized
 */
router
    .route('/logout')
    .post(
        authenticateToken,
        authorizeRoles('patient', 'doctor'),
        logout
    );
/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Send a password reset link to email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Reset link sent
 *       400:
 *         description: Email not found
 */
router
    .route('/forgot-password')
    .post(
        forgotPasswordLimiter,
        forgotPassword
    );

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset password using token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid or expired token
 */
router
    .route('/reset-password')
    .post(
        resetPassword
    );
/**
 * @swagger
 * /auth/change-password:
 *   post:
 *     summary: Change password for the authenticated user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 example: old_password123
 *               newPassword:
 *                 type: string
 *                 example: new_password456
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Validation error or old password incorrect
 *       401:
 *         description: Unauthorized
 */

router
    .route('/change-password')
    .post(
        authenticateToken,
        authorizeRoles("patient", "doctor"),
        changePassword
    );

module.exports = router;


============================================================
FILE: routes/deviceRoute.js
============================================================
const express = require('express');
const router = express.Router();
const { bindDeviceToPatient } = require('../controllers/deviceController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Devices
 *   description: Device management for patients
 */

/**
 * @swagger
 * /devices/bind:
 *   post:
 *     summary: Bind a device to the authenticated patient
 *     tags: [Devices]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - deviceId
 *             properties:
 *               deviceId:
 *                 type: string
 *                 example: "device123"
 *     responses:
 *       200:
 *         description: Device successfully bound to patient
 *       400:
 *         description: Validation error or device not found
 *       401:
 *         description: Unauthorized
 */
router
    .route('/bind')
    .post(
        authenticateToken,
        authorizeRoles('patient'),
        bindDeviceToPatient
    );

module.exports = router;


// const express = require('express');
// const router = express.Router();
// const { bindDeviceToPatient } = require('../controllers/deviceController');
// const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

// router
//     .route('/bind')
//     .post(
//         authenticateToken,
//         authorizeRoles('patient'),
//         bindDeviceToPatient
//     )

// module.exports = router;

============================================================
FILE: routes/doctorRoute.js
============================================================
const express = require('express');
const router = express.Router();
const { getProfile, getPatients, getPatientProfile } = require('../controllers/doctorController');
const { handlePrediction, handleTreatment, handleFullReport } = require("../controllers/aiController");
const { getProfileValidator, getPatientsValidator, getPatientProfileValidator } = require('../validators/doctorValidator');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

/**
 * @swagger
 * /doctors/{id}:
 *   get:
 *     summary: Get doctor profile
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Doctor ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Doctor profile fetched successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Doctor not found
 */
router
    .route('/:id')
    .get(
        authenticateToken,
        authorizeRoles('doctor'),
        getProfileValidator,
        getProfile
    );

/**
 * @swagger
 * /doctors/{id}/patients:
 *   get:
 *     summary: Get all patients assigned to a doctor
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Doctor ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of patients fetched successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Doctor or patients not found
 */
router
    .route('/:id/patients')
    .get(
        authenticateToken,
        authorizeRoles('doctor'),
        getPatientsValidator,
        getPatients
    );

/**
 * @swagger
 * /doctors/{doctorId}/patients/{patientId}:
 *   get:
 *     summary: Get profile of a specific patient under a doctor
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Patient profile fetched successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Patient not found
 */
router
    .route('/:doctorId/patients/:patientId')
    .get(
        authenticateToken,
        authorizeRoles('doctor'),
        getPatientProfileValidator,
        getPatientProfile
    );

/**
 * @swagger
 * /doctors/predict:
 *   post:
 *     summary: Predict diagnosis based on patient vitals
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               age:
 *                 type: number
 *               gender:
 *                 type: string
 *               snoring:
 *                 type: number
 *               oxygen_saturation:
 *                 type: number
 *               bmi:
 *                 type: number
 *               ahi:
 *                 type: number
 *     responses:
 *       200:
 *         description: Prediction result
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post(
    "/predict",
    authenticateToken,
    authorizeRoles("doctor"),
    handlePrediction
);

/**
 * @swagger
 * /doctors/treatment:
 *   post:
 *     summary: Generate treatment plan
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               severity:
 *                 type: number
 *               gender:
 *                 type: string
 *               bmi:
 *                 type: number
 *               snoring:
 *                 type: number
 *               ahi:
 *                 type: number
 *     responses:
 *       200:
 *         description: Treatment plan generated
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post(
    "/treatment",
    authenticateToken,
    authorizeRoles("doctor"),
    handleTreatment
);

/**
 * @swagger
 * /doctors/full_report:
 *   post:
 *     summary: Generate full report for a patient
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               age:
 *                 type: number
 *               gender:
 *                 type: string
 *               snoring:
 *                 type: number
 *               oxygen_saturation:
 *                 type: number
 *               bmi:
 *                 type: number
 *               ahi:
 *                 type: number
 *     responses:
 *       200:
 *         description: Full report generated
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post(
    "/full_report",
    authenticateToken,
    authorizeRoles("doctor"),
    handleFullReport
);

module.exports = router;


// const express = require('express');
// const router = express.Router();
// const { getProfile, getPatients, getPatientProfile } = require('../controllers/doctorController');
// const { handlePrediction, handleTreatment, handleFullReport } = require("../controllers/aiController");
// const { getProfileValidator, getPatientsValidator, getPatientProfileValidator } = require('../validators/doctorValidator');
// const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');


// /**
//  * @route GET /api/v1/doctors/:id
//  * @access protected
//  */
// router
//     .route('/:id')
//     .get(
//         authenticateToken,
//         authorizeRoles('doctor'),
//         getProfileValidator,
//         getProfile
//     )

// /**
//  * @route GET /api/v1/doctors/:id/patients
//  * @access protected
//  */
// router
//     .route('/:id/patients')
//     .get(
//         authenticateToken,
//         authorizeRoles('doctor'),
//         getPatientsValidator,
//         getPatients
//     )

// /**
//  * @route GET /api/v1/doctors/:doctorId/patients/:patientId
//  * @access protected
//  */
// router
//     .route('/:doctorId/patients/:patientId')
//     .get(
//         authenticateToken,
//         authorizeRoles('doctor'),
//         getPatientProfileValidator,
//         getPatientProfile
//     )

// // Existing routes
// // AI Routes for Doctor
// /**
//  * @route POST http://localhost:4000/api/v1/doctors/predict
//  * @access protected
//  */

// router.post(
//     "/predict",
//     authenticateToken,
//     authorizeRoles("doctor"),
//     handlePrediction
// );
// /**
//  * @route POST http://localhost:4000/api/v1/doctors/treatment
//  * @access protected
//  */

// router.post(
//     "/treatment",
//     authenticateToken,
//     authorizeRoles("doctor"),
//     handleTreatment
// );
// /**
//  * @route POST http://localhost:4000/api/v1/doctors/full_report
//  * @access protected
//  */
// router.post(
//     "/full_report",
//     authenticateToken,
//     authorizeRoles("doctor"),
//     handleFullReport
// );
// module.exports = router;

============================================================
FILE: routes/notificationRoute.js
============================================================
const express = require('express');
const router = express.Router();
const {
    getMyNotifications,
    markAsSeen,
    createNotification,
    sendGeneral,
    getNotificationById
} = require('../controllers/NotificationController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: User notifications management
 */

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Get notifications for the logged-in user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of notifications
 *       401:
 *         description: Unauthorized
 */
router
    .route('/')
    .get(
        authenticateToken,
        authorizeRoles('doctor', 'patient'),
        getMyNotifications
    );

/**
 * @swagger
 * /notifications:
 *   post:
 *     summary: Create a system-triggered notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *               - receiverId
 *               - type
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               receiverId:
 *                 type: integer
 *               type:
 *                 type: string
 *                 example: "appointment"
 *     responses:
 *       201:
 *         description: Notification created successfully
 */
router
    .route('/')
    .post(
        authenticateToken,
        createNotification
    );

/**
 * @swagger
 * /notifications/{id}/seen:
 *   patch:
 *     summary: Mark a notification as seen
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification marked as seen
 *       404:
 *         description: Notification not found
 */
router
    .route('/:id/seen')
    .patch(
        authenticateToken,
        markAsSeen
    );

/**
 * @swagger
 * /notifications/general:
 *   post:
 *     summary: Send a general system notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: General notification sent
 */
router
    .route('/general')
    .post(
        authenticateToken,
        authorizeRoles("patient", 'doctor'),
        sendGeneral
    );

/**
 * @swagger
 * /notifications/{id}:
 *   get:
 *     summary: Get a notification by ID
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification data
 *       404:
 *         description: Notification not found
 */
router
    .route('/:id')
    .get(
        authenticateToken,
        getNotificationById
    );

module.exports = router;


// const express = require('express');
// const router = express.Router();
// const { getMyNotifications, markAsSeen, createNotification, sendGeneral, getNotificationById } = require('../controllers/NotificationController');
// const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

// /**
//  * @route   GET /api/v1/notifications
//  * @desc    Get notifications for the currently logged-in user
//  * @access  protected
//  */
// router
//     .route('/')
//     .get(
//         authenticateToken,
//         authorizeRoles('doctor', 'patient'),
//         getMyNotifications
//     );

// /**
//  * @route   PATCH /api/v1/notifications/:id/seen
//  * @desc    Mark a specific notification as seen
//  * @access  protected
//  */
// router
//     .route('/:id/seen')
//     .patch(
//         authenticateToken,
//         markAsSeen
//     );

// /**
//  * @route   POST /api/v1/notifications/
//  * @desc    Create/send a system-triggered notification (like appointment or vitals)
//  * @access  protected
//  */
// router
//     .route('/')
//     .post(
//         authenticateToken,
//         createNotification
//     );

// /**
//  * @route   POST /api/v1/notifications/general
//  * @desc    Send general/greeting/system notification (used by system itself)
//  * @access  protected
//  */
// router
//     .route('/general')
//     .post(
//         authenticateToken,
//         authorizeRoles("patient", 'doctor'),
//         sendGeneral
//     );
// /**
//  * @route   GET /api/v1/notifications/:id
//  * @desc    Get Notification by id
//  * @access  private
//  */
// router
//     .route('/:id')
//     .get(
//         authenticateToken,
//         getNotificationById
//     );

// module.exports = router;

============================================================
FILE: routes/patientRoute.js
============================================================
const express = require("express");
const router = express.Router();
const { getProfile, updateProfile } = require("../controllers/patientController");
const { handlePrediction, handleTreatment, handleReport } = require("../controllers/aiController");
const { updateProfileValidator, getProfileValidator } = require("../validators/patientValidator");
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");

/**
 * @swagger
 * /patients/{id}:
 *   get:
 *     summary: Get patient profile
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Patient ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Patient profile fetched successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Patient not found
 *   put:
 *     summary: Update patient profile
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Patient ID
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               age:
 *                 type: number
 *               gender:
 *                 type: string
 *               height:
 *                 type: number
 *               weight:
 *                 type: number
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router
    .route('/:id')
    .get(
        authenticateToken,
        authorizeRoles('patient'),
        getProfileValidator,
        getProfile
    )
    .put(
        authenticateToken,
        authorizeRoles('patient'),
        updateProfileValidator,
        updateProfile
    );

/**
 * @swagger
 * /patients/predict:
 *   post:
 *     summary: Predict diagnosis based on vitals
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               age:
 *                 type: number
 *               gender:
 *                 type: string
 *               snoring:
 *                 type: number
 *               oxygen_saturation:
 *                 type: number
 *               bmi:
 *                 type: number
 *               ahi:
 *                 type: number
 *     responses:
 *       200:
 *         description: Prediction result
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router
    .route('/predict')
    .post(
        authenticateToken,
        authorizeRoles("patient"),
        handlePrediction
    );

/**
 * @swagger
 * /patients/treatment:
 *   post:
 *     summary: Generate treatment plan for patient
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               severity:
 *                 type: number
 *               gender:
 *                 type: string
 *               bmi:
 *                 type: number
 *               snoring:
 *                 type: number
 *               ahi:
 *                 type: number
 *     responses:
 *       200:
 *         description: Treatment plan generated
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router
    .route('/treatment')
    .post(
        authenticateToken,
        authorizeRoles("patient"),
        handleTreatment
    );

/**
 * @swagger
 * /patients/report:
 *   post:
 *     summary: Generate summary report for patient
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               age:
 *                 type: number
 *               gender:
 *                 type: string
 *               snoring:
 *                 type: number
 *               oxygen_saturation:
 *                 type: number
 *               bmi:
 *                 type: number
 *               ahi:
 *                 type: number
 *     responses:
 *       200:
 *         description: Report generated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router
    .route('/report')
    .post(
        authenticateToken,
        authorizeRoles("patient"),
        handleReport
    );

module.exports = router;



// const express = require("express");
// const router = express.Router();
// const { getProfile, updateProfile } = require("../controllers/patientController");
// const { handlePrediction, handleTreatment, handleReport } = require("../controllers/aiController");
// const { updateProfileValidator, getProfileValidator } = require("../validators/patientValidator");
// const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");

// /**
//  * @route GET, PUT /api/v1/patients/:id
//  * @access protected 
//  */
// router
//     .route('/:id')
//     .get(
//         authenticateToken,
//         authorizeRoles('patient'),
//         getProfileValidator,
//         getProfile
//     )
//     .put(
//         authenticateToken,
//         authorizeRoles('patient'),
//         updateProfileValidator,
//         updateProfile
//     )



// // Existing routes from Railway Server
// // AI Routes for Patient
// /**
//  * @route POST http://localhost:4000/api/v1/patients/predict
//  * @access protected
//  */
// router
//     .route('/predict')
//     .post(
//         authenticateToken,
//         authorizeRoles("patient"),
//         handlePrediction
//     );

// /**
//  * @route POST http://localhost:4000/api/v1/patients/treatment
//  * @access protected
//  */
// router
//     .route('/treatment')
//     .post(
//         authenticateToken,
//         authorizeRoles("patient"),
//         handleTreatment
//     );

// /**
//  * @route POST http://localhost:4000/api/v1/patients/report
//  * @access protected
//  */
// router
//     .route('/report')
//     .post(
//         authenticateToken,
//         authorizeRoles("patient"),
//         handleReport
//     );


// module.exports = router;

============================================================
FILE: routes/vitalsRoute.js
============================================================
const express = require("express");
const router = express.Router();
const {
  listenToFirebaseVitals,
  getLastAveragedVitals
} = require("../controllers/vitalsController");
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");
const { vitalsRateLimiter } = require("../middleware/rateLimiter");

/**
 * @swagger
 * tags:
 *   name: Vitals
 *   description: Realtime and averaged vital signs
 */

/**
 * @swagger
 * /vitals/average:
 *   post:
 *     summary: Receive realtime vitals from Firebase and calculate average
 *     tags: [Vitals]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully calculated average vitals
 *       429:
 *         description: Too many requests
 *       401:
 *         description: Unauthorized
 */
router
  .route("/average")
  .post(
    authenticateToken,
    authorizeRoles("patient", "doctor"),
    vitalsRateLimiter,
    listenToFirebaseVitals
  );

/**
 * @swagger
 * /vitals/last-averaged:
 *   get:
 *     summary: Get last averaged vitals for current user
 *     tags: [Vitals]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns last averaged vitals
 *       404:
 *         description: No averaged vitals found
 */
router
  .route("/last-averaged")
  .get(
    authenticateToken,
    authorizeRoles("patient", "doctor"),
    getLastAveragedVitals
  );

module.exports = router;


// const express = require("express");
// const router = express.Router();
// const { listenToFirebaseVitals, getLastAveragedVitals } = require("../controllers/vitalsController");
// const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");
// const { vitalsRateLimiter } = require("../middleware/rateLimiter");


// /**
//  * @route POST, GET /api/v1/vitals/average
//  * @access protected 
//  */
// router
//   .route("/average")
//   .post(
//     authenticateToken,
//     authorizeRoles("patient", "doctor"),
//     vitalsRateLimiter,
//     listenToFirebaseVitals
//   )

// router
//   .route('/last-averaged')
//   .get(
//     authenticateToken,
//     authorizeRoles('patient', 'doctor'),
//     getLastAveragedVitals
//   )

// module.exports = router;

============================================================
FILE: services/aiService.js
============================================================
const axios = require("axios");
const AI_BASE_URL = process.env.AI_SERVER_URL;

// 1. Predict Sleep Apnea
async function predictSleepApnea(data, token) {
  const res = await axios.post(`${AI_BASE_URL}/predict`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}

// 2. Treatment Recommendation
async function getTreatmentPlan(data, token) {
  const res = await axios.post(`${AI_BASE_URL}/treatment`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}

// 3. Short Report
async function getReport(data, token) {
  const res = await axios.post(`${AI_BASE_URL}/report`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}

// 4. Full Report (Detailed)
async function getFullReport(data, token) {
  const res = await axios.post(`${AI_BASE_URL}/full_report`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}

module.exports = {
  predictSleepApnea,
  getTreatmentPlan,
  getReport,
  getFullReport,
};


============================================================
FILE: services/firebaseVitalsService.js
============================================================
const { Vitals, Device } = require('../models');
const db = require("../config/firebase");
const redisClient = require("../config/redisClient");

/**
 * @desc Listen to Firebase Realtime Database and store vitals in Redis buffer
 */
exports.listenToFirebaseVitals = () => {
    const vitalsRef = db.ref("vitals");

    vitalsRef.on("child_added", async (snapshot) => {
        const data = snapshot.val();
        const { serialNumber, ...vitals } = data;

        if (!serialNumber) return console.error("Missing serialNumber");

        // 👇 نحول البيانات JSON ونضيفها إلى list في Redis
        await redisClient.rPush(`vitals:${serialNumber}`, JSON.stringify(vitals));
        console.log(`📥 Buffered vitals for ${serialNumber} in Redis`);
    });
};


============================================================
FILE: services/NotificationService.js
============================================================
const { Notification } = require('../models');
const { getContextData, generateMessageByType } = require('../utils/notificationTemplates');

const send = async ({
  type,
  recipient_id,
  sender_id,
  context_type,
  context_id,
  title,
  message,
  target_app,
  delivery_method = 'IN_APP',
  patientId = null,
  doctorId = null,
  appointmentId = null
}) => {
  // Get contextual data for dynamic content generation
  const context = await getContextData(context_type, context_id);

  // Auto-generate title and message if not provided
  if (!title || !message) {
    const generated = generateMessageByType(type, context);
    title = title || generated.title;
    message = message || generated.message;
  }

  // Create the notification in the database
  const notification = await Notification.create({
    type,
    title,
    message,
    recipient_id,
    sender_id,
    context_type,
    context_id,
    target_app,
    delivery_method,
    patientId,            // ✅ جديد
    doctorId,              // ✅ جديد
    appointmentId     // ✅ جديد
  });

  // Optional: handle push notification delivery (if needed)
  if (delivery_method === 'PUSH') {
    // TODO: integrate with FCM or any push notification service
  }

  return notification;
};
module.exports = { send };


============================================================
FILE: socket/index.js
============================================================
const { Server } = require("socket.io");
const registerNotificationHandlers = require("./notificationSocket");
const socketAuth = require('../middleware/socketAuth');

function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // JWT authentication middleware
  io.use(socketAuth);

  // Save io to global object so background tasks can use it
  global.io = io;

  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.onAny((event, data) => {
      console.log(`[${socket.id}] Event: ${event}`, data);
    });

    // ✅ Notification system
    registerNotificationHandlers(socket, io);

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

module.exports = initSocket;


============================================================
FILE: socket/notificationSocket.js
============================================================
function registerNotificationHandlers(socket, io) {
  socket.on("test", (data) => {
    console.log(`[${socket.id}] Received 'test':`, data);
    socket.emit("reply", { msg: "Test received by server", from: "server" });
  });

  // Add your notification logic here (e.g. alerts, general notifications, etc.)
}

module.exports = registerNotificationHandlers;

============================================================
FILE: tasks/flushBufferedVitals.js
============================================================
const redisClient = require('../config/redisClient');
const { Vitals, Device } = require('../models');

const flushBufferedVitals = async () => {
    const keys = await redisClient.keys("vitals:*");

    for (const key of keys) {
        const serialNumber = key.split(":")[1];
        const vitalsJsonArray = await redisClient.lRange(key, 0, -1);

        if (vitalsJsonArray.length === 0) continue;

        const vitalsArray = vitalsJsonArray.map(JSON.parse);

        try {
            const device = await Device.findOne({ where: { serialNumber } });
            if (!device || !device.patientId) {
                console.warn(`Device not linked: ${serialNumber}`);
                continue;
            }

            const averageVitals = {};
            const fields = ['Heart_Rate', 'Oxygen_Saturation', 'Snoring', 'AHI', 'BMI', 'Age'];

            fields.forEach(field => {
                const sum = vitalsArray.reduce((acc, item) => acc + (item[field] || 0), 0);
                averageVitals[field] = sum / vitalsArray.length;
            });

            averageVitals.Gender = vitalsArray[vitalsArray.length - 1].Gender;
            averageVitals.severity = Math.max(...vitalsArray.map(v => v.severity || 0));

            const vitals = await Vitals.create({
                patientId: device.patientId,
                deviceId: device.deviceId,
                ...averageVitals,
                source: "device",
            });

            if (global.io) {
                global.io.emit("newVitals", {
                    patientId: device.patientId,
                    vitals,
                });
            }

            console.log(`Saved Redis-Buffered vitals for ${serialNumber}`);
        } catch (err) {
            console.error(`Failed to save vitals for ${serialNumber}:`, err.message);
        }

        // 🧹 امسح البيانات من Redis بعد التخزين
        await redisClient.del(key);
    }
};

// ⏱ شغّل التفريغ كل 30 دقيقة
setInterval(flushBufferedVitals, 30 * 60 * 1000);

module.exports = { flushBufferedVitals };


============================================================
FILE: utils/errors/ApiError.js
============================================================
// utils/errors/ApiError.js

class ApiError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        // Captures the stack trace excluding the constructor call
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = ApiError;
  

============================================================
FILE: utils/genderMap.js
============================================================
const genderMap = {
    0: "Male",
    1: "Female",
    "0": "Male",
    "1": "Female",
    male: "Male",
    female: "Female",
    Male: "Male",
    Female: "Female",
};

module.exports = genderMap;

============================================================
FILE: utils/notificationTemplates.js
============================================================
const { Appointment, Device, TestResult } = require('../models');

/**
 * Fetch contextual data based on the notification type
 * @param {string} context_type - APPOINTMENT / DEVICE / TEST
 * @param {number} context_id - ID of the related entity
 * @returns {Object} The related data to help generate message content
 */
const getContextData = async (context_type, context_id) => {
  switch (context_type) {
    case 'APPOINTMENT':
      return await Appointment.findByPk(context_id);
    case 'DEVICE':
      return await Device.findByPk(context_id);
    case 'TEST':
      return await TestResult.findByPk(context_id);
    default:
      return {};
  }
};

/**
 * Generate dynamic title and message based on notification type and context
 * @param {string} type - Type of the notification (e.g., APPOINTMENT, ALERT, VITALS)
 * @param {Object} context - Data related to the context_type and context_id
 * @returns {Object} { title, message }
 */
const generateMessageByType = (type, context) => {
  switch (type) {
    case 'APPOINTMENT':
      return {
        title: 'New Appointment Booked',
        message: `Your appointment has been scheduled for ${context?.appointment_date?.toLocaleDateString('ar-EG')} at ${context?.appointment_date?.toLocaleTimeString('ar-EG')}. Please make sure to attend.`
      };

    case 'ALERT':
      return {
        title: 'Critical Health Alert',
        message: `A critical condition was detected by your connected device. Please consult your doctor immediately.`
      };

    case 'VITALS':
      return {
        title: 'Vitals Updated',
        message: `Latest readings: Oxygen ${context?.oxygen}%, Pulse ${context?.pulse} bpm, Blood Pressure ${context?.bp}.`
      };

    case 'GENERAL':
      return {
        title: 'Good Morning',
        message: 'We wish you a healthy and productive day!'
      };

    case 'SYSTEM':
      return {
        title: 'System Notification',
        message: context?.customMessage || 'A system update or change has been made.'
      };

    default:
      return {
        title: 'New Notification',
        message: 'You have a new notification.'
      };
  }
};

module.exports = {
  getContextData,
  generateMessageByType
};

============================================================
FILE: validators/adminValidator.js
============================================================
const { body, param } = require("express-validator");
const { validateRequest } = require('../middleware/validateRequest');
const genderMap = require('../utils/genderMap');

exports.addDoctorValidator = [
    body("firstName")
        .notEmpty().withMessage("First name is required")
        .isLength({ min: 2 }).withMessage("First name must be at least 2 characters"),

    body("lastName")
        .notEmpty().withMessage("Last name is required")
        .isLength({ min: 2 }).withMessage("Last name must be at least 2 characters"),

    body("email")
        .isEmail().withMessage("Valid email is required")
        .normalizeEmail(),

    body("password")
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),

    body("phoneNumber")
        .notEmpty().withMessage("Phone number is required")
        .matches(/^01[0-9]{9}$/).withMessage("Phone number must be a valid Egyptian number"),

    body("specialization")
        .notEmpty().withMessage("Specialization is required"),

    body("gender")
        .notEmpty().withMessage('Gender is required')
        .custom((value) => {
            if (!genderMap.hasOwnProperty(value)) {
                throw new Error("Gender must be 0 (Male) or 1 (Female), or 'Male' / 'Female'");
            }
            return true;
        })
        .customSanitizer((value) => genderMap[value]),
    validateRequest
];

exports.deleteDoctorValidator = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('Doctor ID must be a positive integer'),
    validateRequest,
];

============================================================
FILE: validators/appointmentValidator.js
============================================================
const { body, param } = require("express-validator");
const { validateRequest } = require('../middleware/validateRequest');

exports.createAppointmentValidator = [
    body('patient_id')
        .isInt({ min: 1 })
        .withMessage('Patient ID must be a positive integer'),
    body('appointment_date')
        .notEmpty()
        .withMessage('Appointment date is required')
        .isISO8601()
        .withMessage('Appointment date must be a valid ISO 8601 date'),

    validateRequest
]

============================================================
FILE: validators/authValidator.js
============================================================
const { body } = require('express-validator');
const { validateRequest } = require("../middleware/validateRequest");
const genderMap = require('../utils/genderMap');
// Signup validation 

exports.signupPatientValidator = [
    body('firstName')
        .notEmpty().withMessage('First name is required')
        .isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),

    body('lastName')
        .notEmpty().withMessage('Last name is required')
        .isLength({ min: 2 }).withMessage('Last name must be at least 2 characters'),

    body('email')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please enter a valid email address'),

    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),

    body('height')
        .notEmpty().withMessage('Height is required')
        .isFloat({ min: 0 }).withMessage('Height must be a positive number'),

    body('weight')
        .notEmpty().withMessage('Weight is required')
        .isFloat({ min: 0 }).withMessage('Weight must be a positive number'),

    body('gender')
        .notEmpty().withMessage('Gender is required')
        .custom((value) => {
            if (!genderMap.hasOwnProperty(value)) {
                throw new Error("Gender must be 0 (Male) or 1 (Female), or 'Male' / 'Female'");
            }
            return true;
        })
        .bail()
        .customSanitizer(value => genderMap[value]),
    body('age')
        .notEmpty().withMessage('Age is required')
        .isInt({ min: 0 }).withMessage('Age must be a positive integer'),

    body('doctorId')
        .notEmpty().withMessage('DoctorId is required')
        .isInt({ min: 1 }).withMessage('Doctor ID must be a valid integer'),
    validateRequest
];

//Login validation
exports.loginValidator = [
    body('email')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please enter a valid email address'),

    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
    validateRequest
];

============================================================
FILE: validators/doctorValidator.js
============================================================
const { body, param } = require('express-validator');
const { validateRequest } = require("../middleware/validateRequest");

exports.getProfileValidator = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('Doctor ID must be a positive integer'),
    validateRequest,
];

exports.getPatientsValidator = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('Doctor ID must be a positive integer'),
    validateRequest
];

exports.getPatientProfileValidator = [
    param('doctorId')
        .isInt({ min: 1 })
        .withMessage('Doctor ID must be a positive integer'),
    param('patientId')
        .isInt({ min: 1 })
        .withMessage('Patient ID must be a positive integer'),
    validateRequest
];

============================================================
FILE: validators/patientValidator.js
============================================================
const { body, param } = require('express-validator');
const { validateRequest } = require('../middleware/validateRequest');
const genderMap = require("../utils/genderMap");

exports.updateProfileValidator = [
    body("firstName")
        .optional()
        .isString()
        .withMessage("First name must be a string"),
    body("lastName")
        .optional()
        .isString()
        .withMessage("Last name must be a string"),
    body("email")
        .optional()
        .isEmail()
        .withMessage("Invalid email address"),
    body("password")
        .optional()
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters"),
    body("phoneNumber")
        .optional()
        .isString()
        .withMessage("Phone number must be a string"),
    body("medicalHistory")
        .optional()
        .isString()
        .withMessage("Medical history must be a string"),
    body("age")
        .optional().isInt({ min: 0 }).withMessage("Age must be a positive integer"),
    body("height")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("Height must be a positive number"),
    body("weight")
        .optional()
        .isFloat({ min: 0 }).withMessage("Weight must be a positive number"),
    body("gender")
        .optional()
        .custom((value) => {
            if (!genderMap.hasOwnProperty(value)) {
                throw new Error("Gender must be 0 (Male), 1 (Female), 'Male', or 'Female'");
            }
            return true;
        })
        .bail()
        .customSanitizer(value => genderMap[value]),

    body("img").optional().isURL().withMessage("Image must be a valid URL"),

    validateRequest
];

exports.getProfileValidator = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('Patient ID must be a positive integer'),
    validateRequest,
];

============================================================
FILE: app.js
============================================================
// 1. Core & External Modules
const express = require("express");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

// 2. Config & Database
const sequelize = require("./config/database");
require("./models/associationsModel");

// 3. Swagger (API Docs)
const { swaggerUi, swaggerSpec } = require('./config/swagger');

// Express App Setup
const app = express();

// Error Middleware 
const { globalErrorHandler, notFoundHandler } = require("./middleware/errorMiddleware");

// Routes
const authRoutes = require('./routes/authRoute');
const adminRoutes = require("./routes/adminRoute");
const doctorRoutes = require("./routes/doctorRoute");
const patientRoutes = require("./routes/patientRoute");
const appointmentRoutes = require("./routes/appointmentRoute");
const notificationRoutes = require("./routes/notificationRoute");
const deviceRoutes = require("./routes/deviceRoute");
const vitalsRoutes = require("./routes/vitalsRoute");

// Firebase listener
const { listenToFirebaseVitals } = require("./controllers/vitalsController");


app.use(cors({
  origin: "*", // Allow all origins (change in production)
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/doctors", doctorRoutes);
app.use("/api/v1/patients", patientRoutes);
app.use("/api/v1/appointments", appointmentRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/devices", deviceRoutes);
app.use("/api/v1/vitals", vitalsRoutes);

// 6. Error Handling Middleware
app.use(notFoundHandler);
app.use(globalErrorHandler);

// Server + WebSocket
const server = http.createServer(app);
const initSocket = require("./socket");

// Start Server
sequelize.sync({ force: false })
  .then(() => {
    const port = process.env.PORT || 8000;
    server.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });

    // Init WebSocket
    initSocket(server);

    // Start listening to Firebase
    listenToFirebaseVitals();
  })
  .catch((err) => {
    console.error("Failed to start server:", err);
  });


============================================================
FILE: Docs.md
============================================================
Ophiuchus Health Monitoring Backend
1. Overview

This document provides a comprehensive overview of the backend_OPHIUC.git repository. This project is the backend system for a sophisticated health monitoring application, likely named "Ophiuchus Health," designed to track patient vitals, with a specific focus on sleep apnea.

The system facilitates a connection between patients and doctors, processes real-time vital signs from medical devices, and integrates with an external Artificial Intelligence (AI) service. This AI provides predictive analysis, treatment recommendations, and detailed health reports. The architecture is built to be scalable and real-time, using modern technologies like Node.js, WebSockets, and Firebase.

There are three primary user roles within the system:

Patient: The end-user whose health is being monitored. They can manage their profile, bind monitoring devices, view appointments, and receive AI-generated reports about their condition.

Doctor: A healthcare professional who monitors patients, views their data and profiles, schedules appointments, and utilizes advanced AI tools for diagnosis and treatment planning.

Admin: A system administrator responsible for managing the platform, primarily by adding and removing doctor accounts.

2. Features
User & Authentication

Role-Based Access Control: Secure endpoints for Admins, Doctors, and Patients.

JWT Authentication: User authentication is handled via JSON Web Tokens, with a blacklist feature using Redis to manage logouts.

Patient Signup: New patients can register, linking to a specific doctor.

Unified Login: A single login endpoint for all roles (Admin, Doctor, Patient).

Admin Functionality

Doctor Management: Admins can add, view, and soft-delete doctor profiles from the system.

Doctor Functionality

Patient Management: Doctors can view a list of their assigned patients and access individual patient profiles.

Appointment Scheduling: Doctors can create new appointments for their patients.

AI Integration:

Request sleep apnea predictions.

Generate treatment plans.

Generate full, detailed patient reports.

Patient Functionality

Profile Management: Patients can view and update their personal and medical information.

Device Management: Patients can bind a physical monitoring device to their account using its serial number (e.g., from a QR code scan).

Appointment Viewing: Patients can see a list of their upcoming appointments, including doctor details.

AI Integration:

Request sleep apnea predictions based on their data.

Receive treatment recommendations.

Generate a summary report of their health status.

Real-time Vitals & Notifications

Firebase Integration: The system listens to a Firebase Realtime Database for new vital signs data pushed from monitoring devices.

Real-time Vitals Feed: Vitals are processed and broadcast to relevant clients (doctors/patients) in real-time using Socket.IO.

Alerting System: The system uses Redis to count consecutive "Severe" sleep apnea predictions and sends a real-time alert to Firebase after a certain threshold is met.

In-App Notification System: A comprehensive notification system that creates and delivers alerts for events like new appointments, system messages, and health alerts.

3. Technology Stack

Backend Framework: Express.js

Language: Node.js (CommonJS)

Database: MySQL (inferred from mysql2 driver and Sequelize dialect)

ORM: Sequelize

Authentication: JSON Web Token (JWT)

Real-time Communication: Socket.IO, Firebase Realtime Database

In-Memory Data Store: Redis (used for JWT blacklisting and buffering vital signs)

HTTP Client: Axios (for communicating with the external AI service)

Validation: express-validator

Async Handling: express-async-handler

Environment Management: dotenv

4. Project Structure

The repository is organized into a modular structure that separates concerns, making it maintainable and scalable.

Directory	Purpose
config/	Contains configuration files for connecting to databases (Sequelize/MySQL), Firebase, and Redis.
controllers/	Handles the business logic for incoming HTTP requests. It acts as the bridge between routes and models/services.
middleware/	Contains custom middleware functions for tasks like authentication (authMiddleware), error handling (errorMiddleware), input validation (validateRequest), and rate limiting.
models/	Defines the database schemas and their relationships (associations) using Sequelize.
routes/	Defines the API endpoints and maps them to the appropriate controller functions.
services/	Encapsulates logic for interacting with external services, such as the AI service (aiService) and the notification system (NotificationService).
socket/	Manages WebSocket (Socket.IO) connections and real-time event handling.
tasks/	Contains background jobs or scheduled tasks, such as flushing buffered vitals from Redis to the main database.
utils/	Provides helper functions, custom error classes (ApiError), and static data maps (genderMap).
validators/	Defines validation and sanitization rules for incoming request data using express-validator.
app.js	The main entry point of the application. It initializes the Express server, sets up middleware, mounts routes, and starts the server.
package.json	Lists project dependencies, scripts, and metadata.
5. API Endpoints

Below is a summary of the available API endpoints grouped by functionality.

Authentication (/api/v1/auth)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| POST | /signup | Registers a new patient. | Public |
| POST | /login | Authenticates an admin, doctor, or patient. | Public |
| POST | /logout | Logs out a user by blacklisting their JWT. | Patient, Doctor |

Admin (/api/v1/admin)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| GET | /users/doctors | Retrieves a list of all doctors. | Admin |
| POST | /users/doctors | Adds a new doctor to the system. | Admin |
| DELETE| /users/doctors/:id | Soft-deletes a doctor by their ID. | Admin |

Doctors (/api/v1/doctors)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| GET | /:id | Gets a doctor's public profile. | Doctor |
| GET | /:id/patients | Gets a list of patients assigned to a doctor. | Doctor |
| GET | /:doctorId/patients/:patientId | Gets a specific patient's profile for the doctor. | Doctor |
| POST | /predict | Requests an AI-based sleep apnea prediction. | Doctor |
| POST | /treatment | Requests an AI-based treatment plan. | Doctor |
| POST | /full_report | Requests a full, detailed AI-generated report. | Doctor |

Patients (/api/v1/patients)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| GET | /:id | Gets a patient's profile. | Patient |
| PUT | /:id | Updates a patient's profile information. | Patient |
| POST | /predict | Requests an AI-based sleep apnea prediction. | Patient |
| POST | /treatment | Requests an AI-based treatment plan. | Patient |
| POST | /report | Requests a summary AI-generated report. | Patient |

Appointments (/api/v1/appointments)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| POST | / | Creates a new appointment for a patient. | Doctor |
| GET | / | Gets all appointments for the logged-in user. | Doctor, Patient |

Devices (/api/v1/devices)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| POST | /bind | Binds a device (by serial number) to the logged-in patient. | Patient |

Notifications (/api/v1/notifications)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| GET | / | Gets all notifications for the logged-in user. | Doctor, Patient |
| GET | /:id | Gets a specific notification by its ID. | Doctor, Patient |
| PATCH | /:id/seen | Marks a notification as read. | Doctor, Patient |

Vitals (/api/v1/vitals)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| GET | /last-averaged | Retrieves the latest vital records from the last 30 minutes. | Patient, Doctor |

6. Setup and Installation

To run this project locally, follow these steps:

Clone the repository:

Generated bash
git clone <repository_url>
cd backend_OPHIUC.git


Install dependencies:

Generated bash
npm install
IGNORE_WHEN_COPYING_START
content_copy
download
Use code with caution.
Bash
IGNORE_WHEN_COPYING_END

Create a .env file:
Create a file named .env in the root of the project and add the following environment variables. Replace the placeholder values with your actual configuration.

Generated env
# Server Configuration
PORT=8000
NODE_ENV=development

# Database (MySQL)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=ophiuchus_db
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DIALECT=mysql

# JWT
JWT_SECRET=ophiucs-project-secret-jwt

# Redis
REDIS_URL=redis://localhost:6379

# Static Admin User
ADMIN_EMAIL=admin@ophiuchus.com
ADMIN_PASSWORD=adminpassword

# External AI Service
AI_SERVER_URL=http://your-ai-server-url.com
IGNORE_WHEN_COPYING_START
content_copy
download
Use code with caution.
Env
IGNORE_WHEN_COPYING_END

Set up Firebase:

You will need a Firebase project with the Realtime Database enabled.

Download your Firebase service account key JSON file and place it in the config/ directory. The code expects it to be named osahealthmonitor-firebase-adminsdk-fbsvc-f42e920593.json.

Update the databaseURL in config/firebase.js if it differs.

Start the server:

For development with auto-reloading:

Generated bash
npm run start:dev
IGNORE_WHEN_COPYING_START
content_copy
download
Use code with caution.
Bash
IGNORE_WHEN_COPYING_END

For production:

Generated bash
npm run start:prod
IGNORE_WHEN_COPYING_START
content_copy
download
Use code with caution.
Bash
IGNORE_WHEN_COPYING_END

The server should now be running on the port specified in your .env file.

Google Search Suggestions
Display of Search Suggestions is required when using Grounding with Google Search. Learn more
Ophiuchus Health Monitoring Backend documentation
backend_OPHIUC.git project documentation

============================================================
FILE: package.json
============================================================
{
  "name": "server",
  "version": "1.0.0",
  "description": "Backend_Server",
  "main": "server.js",
  "type": "commonjs",
  "scripts": {
    "start:dev": "cross-env NODE_ENV=development nodemon app.js",
    "start:prod": "cross-env NODE_ENV=production nodemon app.js"
  },
  "author": "",
  "license": "ISC",
  "dependencies": {
    "axios": "^1.10.0",
    "bcryptjs": "^3.0.2",
    "cookie-parser": "^1.4.7",
    "cors": "^2.8.5",
    "crypto": "^1.0.1",
    "dotenv": "^16.4.7",
    "express": "^4.21.2",
    "express-async-handler": "^1.2.0",
    "express-rate-limit": "^7.5.1",
    "express-validator": "^7.2.1",
    "firebase-admin": "^13.4.0",
    "jsonwebtoken": "^9.0.2",
    "mysql2": "^3.14.0",
    "nodemailer": "^7.0.5",
    "redis": "^5.6.0",
    "sequelize": "^6.37.6",
    "socket.io": "^4.8.1",
    "swagger-jsdoc": "^6.2.8",
    "swagger-ui-express": "^5.0.1"
  },
  "devDependencies": {
    "cross-env": "^7.0.3",
    "eslint": "^9.22.0",
    "nodemon": "^3.1.10"
  }
}


============================================================
FILE: README.md
============================================================
# backendProject-V12