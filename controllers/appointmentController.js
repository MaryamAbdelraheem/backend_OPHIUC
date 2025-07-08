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

        const { id, role } = req.user;
        let appointments;

        if (role === 'doctor') {
            appointments = await Appointment.findAll({
                where: { doctorId: id },
                include: [{ model: Patient, attributes: ['firstName', 'lastName', 'email'] }],
                order: [['appointment_date', 'ASC']]
            });
        } else if (role === 'patient') {
            appointments = await Appointment.findAll({
                where: { patientId: id },
                include: [{ model: Doctor, attributes: ['firstName', 'lastName', 'specialization'] }],
                order: [['appointment_date', 'ASC']]
            });
        } else {
            return res.status(403).json({ message: "Access denied." });
        }////

        const formattedAppointments = appointments.map(app => {
            const date = app.appointment_date.toISOString().split('T')[0];
            const time = app.appointment_date.toISOString().split('T')[1].slice(0, 5);

            if (role === 'patient') {
                return {
                    doctorName: `${app.Doctor.firstName} ${app.Doctor.lastName}`,
                    specialization: app.Doctor.specialization,
                    date,
                    time,
                };
            } else {
                return {
                    patientName: `${app.Patient.firstName} ${app.Patient.lastName}`,
                    email: app.Patient.email,
                    date,
                    time,
                };
            }
        });

        res.status(200).json({
            status: "success",
            data: {
                appointments: formattedAppointments
            }
        });
});
