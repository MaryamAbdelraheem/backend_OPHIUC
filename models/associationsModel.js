// في associations.js
const { Doctor, Patient, Appointment, Notification, Vitals, Device } = require('.');

// 1 To M with Doctor => Patient
Doctor.hasMany(Patient);
Patient.belongsTo(Doctor);

// 1 To M Patient => Appointment
Patient.hasMany(Appointment, { foreignKey: 'patientId' });
Appointment.belongsTo(Patient, { foreignKey: 'patientId' });

// 1 To M Doctor => Appointment
Doctor.hasMany(Appointment, { foreignKey: 'doctorId' });
Appointment.belongsTo(Doctor, { foreignKey: 'doctorId' });


// 1 To M Patient => Notification
Notification.belongsTo(Patient, { foreignKey: 'patientId' });
Patient.hasMany(Notification, { foreignKey: 'patientId' });

// 1 To M Doctor => Notification
Notification.belongsTo(Doctor, { foreignKey: 'doctorId' });
Doctor.hasMany(Notification, { foreignKey: 'doctorId' });

// 1 To M Appointment => Notification
Notification.belongsTo(Appointment, { foreignKey: 'appointmentId' });
Appointment.hasMany(Notification, { foreignKey: 'appointmentId' });

//  Device belongs to Patient
Patient.hasMany(Device);
Device.belongsTo(Patient);

//Device belongs to Doctor
Doctor.hasMany(Device);
Device.belongsTo(Doctor);

// ✅ Vitals belongs to Patient
Patient.hasMany(Vitals);
Vitals.belongsTo(Patient);

// ✅ Vitals belongs to Doctor
Doctor.hasMany(Vitals);
Vitals.belongsTo(Doctor);

// ✅ Vitals belongs to Device
Device.hasMany(Vitals);
Vitals.belongsTo(Device);


module.exports = { Doctor, Patient,  Appointment, Vitals, Device };


