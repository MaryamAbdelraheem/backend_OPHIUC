const axios = require("axios");
const db = require("../services/firebaseService");
const Patient = require("../models/patientModel"); // Sequelize model

function registerVitalsHandlers(socket, io) {
  const activeDevices = {};

  socket.on("register_device", ({ device_id }) => {
    if (!device_id) return;
    socket.join(device_id);

    if (activeDevices[device_id]) return;

    console.log(`Registered new device: ${device_id}`);

    const interval = setInterval(async () => {
      try {
        // 1. Fetch sensor data from Firebase
        const snapshot = await db.ref(`devices/${device_id}/sensors`).once("value");
        const sensorData = snapshot.val();
        if (!sensorData) return;

        // 2. Emit raw sensor data to patient
        io.to(device_id).emit("sensor_data", sensorData);

        // 3. Fetch patient info from MySQL using Sequelize
        const patient = await Patient.findOne({ where: { device_id } });
        if (!patient) {
          console.warn(`No patient found for device ${device_id}`);
          return;
        }

        // 4. Combine data for AI
        const completeData = {
          Age: patient.age,
          Gender: patient.gender,
          BMI: patient.bmi,
          Snoring: patient.snoring || "False",
          Oxygen_Saturation: sensorData.Oxygen_Saturation,
          AHI: sensorData.AHI,
          ECG_Heart_Rate: sensorData.ECG_Heart_Rate,
          Nasal_Airflow: sensorData.Nasal_Airflow,
          Chest_Movement: sensorData.Chest_Movement,
          EEG_Sleep_Stage: sensorData.EEG_Sleep_Stage,
        };

        // 5. Send to AI
        const aiResponse = await axios.post("http://localhost:4000/api/ai/predict", completeData);
        const prediction = aiResponse.data;

        // 6. Emit prediction to whoever needs it (patient/doctor)
        io.to(device_id).emit("prediction_result", prediction);

      } catch (err) {
        console.error(`Error with device ${device_id}:`, err.message);
      }
    }, 2000);

    activeDevices[device_id] = interval;
  });

  socket.on("disconnect", () => {
    console.log("Device disconnected.");
    Object.values(activeDevices).forEach(clearInterval);
  });
}

module.exports = registerVitalsHandlers;