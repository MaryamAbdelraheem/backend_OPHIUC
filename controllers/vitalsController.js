// controllers/vitalsController.js
const asyncHandler = require("express-async-handler");
const Vitals = require("../models/vitalsModel");
const Device = require("../models/deviceModel");
const Patient = require("../models/patientModel");

/**
 * @desc Save average vitals for a device (every 30 mins)
 * @route POST /api/vitals/average
 * @access Protected (called internally by backend)
 */
exports.handleAverageVitals = asyncHandler(async (req, res) => {
  const { device_id, ...averageVitals } = req.body;

  if (!device_id) {
    return res.status(400).json({ message: "device_id is required" });
  }

  // Find device
  const device = await Device.findOne({ device_id });
  if (!device) {
    return res.status(404).json({ message: "Device not found" });
  }

  // Find patient assigned to the device
  const patient = await Patient.findById(device.patient_id);
  if (!patient) {
    return res.status(404).json({ message: "Patient not found" });
  }

  // Save vitals
  const vitals = await Vitals.create({
    patient_id: patient._id,
    ...averageVitals,
    timestamp: new Date(),
    source: "device",
  });

  res.status(201).json({
    status: "success",
    message: "Average vitals saved successfully",
    data: vitals,
  });
});