const ApiError = require('../utils/errors/ApiError');
const asyncHandler = require("express-async-handler");
const { Vitals, Device } = require('../models');

/**
 * @desc Save average vitals for a device (every 30 mins)
 * @route POST /api/v1/vitals/average
 * @access Protected (called internally by backend)
 */
exports.handleAverageVitals = asyncHandler(async (req, res, next) => {
  const { serialNumber, ...averageVitals } = req.body;

  if (!serialNumber) {
    return next(new ApiError("serialNumber is required", 400));
  }

  // 1. Fetch the device using serialNumber
  const device = await Device.findOne({ where: { serialNumber } });

  if (!device) {
    return next(new ApiError("Device not found", 404));
  }

  // 2. Make sure the device is linked to a patient.
  if (!device.patientId) {
    return next(new ApiError("Device is not linked to any patient", 400));
  }

  // 3. Create vitals
  const vitals = await Vitals.create({
    patientId: device.patientId,
    deviceId: device.deviceId,
    ...averageVitals,
    source: "device",
  });

  res.status(201).json({
    status: "success",
    message: "Average vitals saved successfully",
    data: { 
      vitals
     },
  });
});