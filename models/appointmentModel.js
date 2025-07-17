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
