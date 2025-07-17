const ApiError = require('../utils/errors/ApiError');
const { Appointment, Notification, Patient, Doctor } = require("../models");
const asyncHandler = require("express-async-handler");

exports.createAppointment = asyncHandler(async (req, res, next) => {
  const doctorId = req.user.id; // من التوكن
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
 * @access Private (for authenticated users like doctors or patients)
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
    doctorName: `${app.Doctor.firstName} ${app.Doctor.lastName}`,
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
