const ApiError = require('../utils/errors/ApiError');
const appointmentRepository = require('../repositories/appointmentRepository');
const patientRepository = require('../repositories/patientRepository');
const doctorRepository = require('../repositories/doctorRepository');
const NotificationService = require('./NotificationService');

class AppointmentService {
  async create({ doctorId, patientId, appointment_date }) {
    const patient = await patientRepository.findById(patientId);
    if (!patient) throw new ApiError("Patient not found", 404);

    const appointment = await appointmentRepository.create({
      doctorId,
      patientId,
      appointment_date
    });

    // Send notification to the patient
    await NotificationService.send({
      type: 'APPOINTMENT_CREATED',
      recipient_id: patientId,
      sender_id: doctorId,
      context_type: 'APPOINTMENT',
      context_id: appointment.appointmentId,
      target_app: 'PATIENT_APP',
      delivery_method: 'IN_APP',
      patientId,
      doctorId,
      appointmentId: appointment.appointmentId
    });

    return appointment;
  }

  async getForPatient(patientId) {
    const appointments = await appointmentRepository.findAllByPatientIdWithDoctor(patientId);

    if (!appointments || appointments.length === 0) {
      throw new ApiError("No appointments found for this patient", 404);
    }

    return appointments.map(app => ({
      doctorName: `Dr. ${app.Doctor.firstName} ${app.Doctor.lastName}`,
      specialization: app.Doctor.specialization,
      date: app.appointment_date.toISOString().split('T')[0],
      time: app.appointment_date.toISOString().split('T')[1].slice(0, 5),
    }));
  }
}

module.exports = new AppointmentService();