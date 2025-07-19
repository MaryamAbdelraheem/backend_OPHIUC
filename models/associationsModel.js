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