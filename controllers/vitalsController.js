const ApiError = require('../utils/errors/ApiError');
const asyncHandler = require("express-async-handler");
const Vitals = require("../models/vitalsModel");
const Device = require("../models/deviceModel");
const Patient = require("../models/patientModel");

/**
 * @desc Save average vitals for a device (every 30 mins)
 * @route POST /api/v1/vitals/average
 * @access Protected (called internally by backend)
 */
exports.handleAverageVitals = asyncHandler(async (req, res, next) => {
  const { deviceId, ...averageVitals } = req.body;

  if (!deviceId) {
    return next(new ApiError("deviceId is required", 400)); // لما نعمل فاليديشن مش هنحتاج السطر دا 
  }

  // Find device
  const device = await Device.findOne({ where: { deviceId } });
  if (!device) {
    return next(new ApiError("Device not found", 404));
  }

  // Find patient assigned to the device
  const patient = await Patient.findByPk(device.patientId);
  if (!patient) {
    return next(new ApiError("Patient not found", 404));
  }

  // Save vitals
  const vitals = await Vitals.create({
    patientId: patient.patientId,
    deviceId: device.deviceId,
    ...averageVitals,
  });

  res.status(201).json({
    status: "success",
    message: "Average vitals saved successfully",
    data: {
      vitals,
    },
  });
});