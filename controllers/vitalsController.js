const asyncHandler = require('express-async-handler');
const { Op } = require('sequelize');
const db = require("../config/firebase");
const { Vitals, Device } = require('../models');
/**
 * @desc Listen to Firebase Realtime Database and save vitals + emit via WebSocket
 */
exports.listenToFirebaseVitals = () => {
  const vitalsRef = db.ref("vitals"); // المسار في Firebase

  vitalsRef.on("child_added", async (snapshot) => {
    const data = snapshot.val();

    try {
      const { serialNumber, ...averageVitals } = data;

      if (!serialNumber) return console.error("Missing serialNumber");

      // 1. Fetch the device
      const device = await Device.findOne({ where: { serialNumber } });
      if (!device || !device.patientId) {
        return console.error("Device not linked or not found");
      }

      // 2. Save vitals
      const vitals = await Vitals.create({
        patientId: device.patientId,
        deviceId: device.deviceId,
        ...averageVitals,
        source: "device",
      });

      // 3. Emit via WebSocket
      if (global.io) {
        global.io.emit("newVitals", {
          patientId: device.patientId,
          vitals,
        });
      }

      console.log("Vitals saved and emitted:", vitals.id);
    } catch (error) {
      console.error("Error saving vitals:", error.message);
    }
  });
};

/**
 * @desc Retrieves the latest vitals averaged and stored from Redis within the last 30 minutes.
 *       This endpoint is intended to display the most recent processed device data for monitoring.
 * @route GET /api/v1/vitals/last-averaged
 * @access private (patient)
 * @returns {Object} 200 - JSON response containing an array of vitals records
 */

exports.getLastAveragedVitals = asyncHandler(async (req, res) => {
  const THIRTY_MINUTES_AGO = new Date(Date.now() - 30 * 60 * 1000);

  const vitals = await Vitals.findAll({
    where: {
      createdAt: {
        [Op.gte]: THIRTY_MINUTES_AGO
      }
    },
    attributes: [
      'patientId',
      'deviceId',
      'Oxygen_Saturation',
      'Snoring',
      'AHI',
      'BMI',
      'Age',
      'Gender',
      'createdAt'
    ],
    order: [['createdAt', 'DESC']]
  });

  res.status(200).json({
    status: 'success',
    results: vitals.length,
    data: {
      vitals
    }
  });
});
