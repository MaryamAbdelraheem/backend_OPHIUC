const ApiError = require('../utils/errors/ApiError');
const { Appointment, Notification, Patient, Doctor } = require("../models");
const asyncHandler = require("express-async-handler");
const appointmentService = require("../services/appointmentService");

/**
 * @desc Create an appointment for the doctor's patient 
 * @route POST /api/v1/appointments
 * @access private (doctors)
 */
exports.createAppointment = asyncHandler(async (req, res, next) => {
  const doctorId = req.user.id;
  const { patient_id, appointment_date } = req.body;

  const appointment = await appointmentService.create({
    doctorId,
    patientId: patient_id,
    appointment_date,
  });

  res.status(201).json({
    status: "success",
    message: "Appointment created successfully",
    data: { appointment }
  });
});

/**
 * @desc Get all appointments with doctor name, specialty, date and time
 * @route GET /api/v1/appointments
 * @access private (for authenticated users like doctors or patients)
 */

exports.getAllAppointmentsWithDoctorInfo = asyncHandler(async (req, res, next) => {
  const patientId = req.user.id;

  const appointments = await appointmentService.getForPatient(patientId);

  res.status(200).json({
    status: "success",
    data: { appointments }
  });
});