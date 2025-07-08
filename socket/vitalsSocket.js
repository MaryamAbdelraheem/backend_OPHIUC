function registerVitalsHandlers(socket, io) {

  // 1.get device_id from client
  // socket.on("register_device", ({ device_id }) => {
  //   // save device_id and join its room
  // });

//////////////////////////////////////////////////////////////

  // 2.access firebase data every 2 seconds
  const sensorDataInterval = setInterval(async () => {

    // 2.1.read sensor data from firebase
    // const snapshot = await db.ref(`devices/${device_id}/sensors`).once("value");
    // const sensorData = snapshot.val();

    // 2.2.send data to AI endpoint
    // const prediction = await axios.post("http://localhost:5000/api/ai/predict", sensorData);

    // 2.3.emit result to doctor in the same device room
    // io.to(device_id).emit("prediction_result", prediction.data);

    socket.emit("sensor_data", dummySensorData);

  }, 2000);

//////////////////////////////////////////////////////////////

  // 3.disconnect
  socket.on("disconnect", () => {
    clearInterval(sensorDataInterval);
  });
}

module.exports = registerVitalsHandlers;