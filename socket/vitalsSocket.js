function registerVitalsHandlers(socket, io) {
  const sensorDataInterval = setInterval(() => {
    const dummySensorData = {
      temperature_mpu: parseFloat((Math.random() * 5 + 25).toFixed(2)),
      temperature_body: parseFloat((Math.random() * 2 + 36).toFixed(2)),
      bpm: Math.floor(Math.random() * 30 + 60),
      ir: Math.floor(Math.random() * 10000) + 50000,
      bp_est: parseFloat((Math.random() * 20 + 80).toFixed(1)),
      accelerometer: {
        x: parseFloat((Math.random() * 0.1 - 0.05).toFixed(4)),
        y: parseFloat((Math.random() * 0.1 - 0.05).toFixed(4)),
        z: parseFloat((Math.random() * 0.5 + 9.5).toFixed(4))
      },
      gyroscope: [
        parseFloat((Math.random() * 0.01 - 0.005).toFixed(4)),
        parseFloat((Math.random() * 0.01 - 0.005).toFixed(4)),
        parseFloat((Math.random() * 0.01 - 0.005).toFixed(4))
      ]
    };

    socket.emit("sensor_data", dummySensorData);
  }, 2000);

  socket.on("disconnect", () => {
    clearInterval(sensorDataInterval);
  });
}

module.exports = registerVitalsHandlers;