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
