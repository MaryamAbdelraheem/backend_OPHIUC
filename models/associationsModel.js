// في associations.js
const { Admin, Doctor, Patient, Appointment, Notification, Vitals, Device } = require('.');

// 1 To M with Doctor => Patient
Doctor.hasMany(Patient);
Patient.belongsTo(Doctor);

// 1 To M Patient => Appointment
Patient.hasMany(Appointment);
Appointment.belongsTo(Patient);

// 1 To M Doctor => Appointment
Doctor.hasMany(Appointment);
Appointment.belongsTo(Doctor);

// 1 To M Patient => Notification
Patient.hasMany(Notification);
Notification.belongsTo(Patient);

// 1 To M Doctor => Notification
Doctor.hasMany(Notification);
Notification.belongsTo(Doctor);

// 1 To M Appointment => Notification
Appointment.hasMany(Notification);
Notification.belongsTo(Appointment);

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
module.exports = { Doctor, Patient, Admin, Appointment, Vitals, Device };


/*// في associations.js
const { Admin, Doctor, Patient, Appointment, Notification, Vitals } = require('.');

// 1 To M with Doctor => Patient
Doctor.hasMany(Patient);
Patient.belongsTo(Doctor);

// 1 To M Patient => Appointment
Patient.hasMany(Appointment);
Appointment.belongsTo(Patient);

// 1 To M Doctor => Appointment
Doctor.hasMany(Appointment);
Appointment.belongsTo(Doctor);

// 1 To M Patient => Notification
Patient.hasMany(Notification);
Notification.belongsTo(Patient);

// 1 To M Doctor => Notification
Doctor.hasMany(Notification);
Notification.belongsTo(Doctor);

// 1 To M Appointment => Notification
Appointment.hasMany(Notification);
Notification.belongsTo(Appointment);

module.exports = { Doctor, Patient, Admin, Appointment, Vitals };*/
