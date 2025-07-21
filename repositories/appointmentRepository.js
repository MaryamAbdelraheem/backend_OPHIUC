const { Appointment, Doctor } = require('../models');

class AppointmentRepository {
   async create(appointmentData) {
    return await Appointment.create(appointmentData);
  }

  async findAllByPatientIdWithDoctor(patientId) {
    return await Appointment.findAll({
      where: { patientId },
      include: [{
        model: Doctor,
        attributes: ['firstName', 'lastName', 'specialization']
      }],
      attributes: ['appointment_date'],
      order: [['appointment_date', 'ASC']],
    });
  }
}

module.exports = new AppointmentRepository();