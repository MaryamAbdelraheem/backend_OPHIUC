//  تقوم باستدعاء associations.js لتهيئة العلاقات بعد تحميل

const { DataTypes } = require('sequelize');
const config = require('../config/config');
const sequelize = require('../utils/database')

const Admin = require('./adminModel')(sequelize, DataTypes);
const Doctor = require('./doctorModel')(sequelize, DataTypes);
const Patient = require('./patientModel')(sequelize, DataTypes);
const Appointment = require('./appointmentModel')(sequelize, DataTypes);
const Notification = require('./notificationModel')(sequelize, DataTypes);
const Vitals = require('./vitalsModel')(sequelize, DataTypes);
const Device = require('./deviceModel')(sequelize, DataTypes);

// استدعاء العلاقات
require('./associationsModel');

module.exports = { Admin, Doctor, Patient, Appointment, Notification, Vitals, Device };