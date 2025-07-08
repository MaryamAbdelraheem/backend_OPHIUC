// controller/appointmentController.js
const { Appointment, Notification, Patient, Doctor } = require("../models");
const asyncHandler = require("express-async-handler");

exports.createAppointment = asyncHandler(async (req, res) => {
    const doctorId = req.user.id; // من التوكن
    const { patient_id, appointment_date, } = req.body;

    // Check if the patient exists
    const patient = await Patient.findByPk(patient_id);
    if (!patient) {
        return res.status(404).json({ message: "Patient not found." });
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
 * @route GET /api/appointments
 * @access Private (for authenticated users like doctors or patients)
 */

exports.getAllAppointmentsWithDoctorInfo = asyncHandler(async (req, res) => {
    const patientId = req.user.id; // مفترض جاي من التوكن بعد فك الـ JWT

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



    const formattedAppointments = appointments.map(app => ({
        doctorName: `${app.Doctor.firstName} ${app.Doctor.lastName}`,
        specialization: app.Doctor.specialization, // ✅ الآن سيظهر بشكل صحيح
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

/**
 * @desc Get all appointments with doctor name, specialty, date and time
 * @route GET /api/appointments
 * @access Private (for authenticated users like doctors or patients)
 */
/*exports.getAllAppointmentsForAdmin = asyncHandler(async (req, res) => {
  const appointments = await Appointment.findAll({
    include: [
      {
        model: Doctor,
        attributes: ['id', 'firstName', 'lastName', 'specialization']
      },
      {
        model: Patient,
        attributes: ['id', 'firstName', 'lastName']
      }
    ],
    order: [['createdAt', 'DESC']]
  });

  const formattedAppointments = appointments.map(app => ({
    doctorName: `${app.Doctor.firstName} ${app.Doctor.lastName}`,
    doctorSpecialization: app.Doctor.specialization,
    patientName: `${app.Patient.firstName} ${app.Patient.lastName}`,
    appointmentDate: app.createdAt.toISOString().split('T')[0],
    appointmentTime: app.createdAt.toISOString().split('T')[1].slice(0, 5),
  }));

  res.status(200).json({
    status: "success",
    data: {
      appointments: formattedAppointments
    }
  });
});*/