function registerNotificationHandlers(socket, io) {
  socket.on("test", (data) => {
    console.log(`[${socket.id}] Received 'test':`, data);
    socket.emit("reply", { msg: "Test received by server", from: "server" });
  });

  // Add your notification logic here (e.g. alerts, general notifications, etc.)
}

module.exports = registerNotificationHandlers;