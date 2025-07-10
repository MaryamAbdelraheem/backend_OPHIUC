const db = require("../services/firebaseService");

function registerVitalsHandlers(socket, io) {
  const activeDevices = {}; // device_id -> interval

  // Step 1: لما الجهاز يتصل ويسجل نفسه
  socket.on("register_device", ({ device_id }) => {
    if (!device_id) return;

    // احفظ الـ socket في روم خاصة بالجهاز (لو حبيت تبعت للدكتور أو الجهاز لاحقًا)
    socket.join(device_id);

    // لو الجهاز متسجل بالفعل، متعملش تكرار
    if (activeDevices[device_id]) return;

    console.log(`✅ Registered new device: ${device_id}`);

    // Step 2: start interval لكل جهاز جديد
    const interval = setInterval(async () => {
      try {
        const snapshot = await db.ref(`devices/${device_id}/sensors`).once("value");
        const sensorData = snapshot.val();

        // send data to device's room
        io.to(device_id).emit("sensor_data", sensorData);
      } catch (err) {
        console.error(`Error reading from ${device_id}:`, err.message);
      }
    }, 2000);

    // خزّن الـ interval عشان توقفه بعدين
    activeDevices[device_id] = interval;
  });

  // Step 3: لو الجهاز انفصل، نظّف الinterval بتاعه
  socket.on("disconnect", () => {
    // Optional: تقدر تمشي على كل الأجهزة وتشوف المربوطة بالسوكيت الحالي (لو محتاجة)
    console.log("🔌 Device disconnected.");
    Object.values(activeDevices).forEach(clearInterval);
  });
}

module.exports = registerVitalsHandlers;