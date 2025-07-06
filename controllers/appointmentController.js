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
        DoctorDoctorId: doctorId,
        PatientPatientId: patient_id,
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
 * @access Private (for authenticated users like doctors or admins)
 */

exports.getAllAppointmentsWithDoctorInfo = asyncHandler(async (req, res) => {
    const patientId = req.user.id; // مفترض جاي من التوكن بعد فك الـ JWT

    const appointments = await Appointment.findAll({
        where: { PatientPatientId: patientId },
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
