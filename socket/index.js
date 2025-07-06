// منظم ملفات الsocket
const { Server } = require("socket.io");
const registerVitalsHandlers = require("./vitalsSocket");
const registerNotificationHandlers = require("./notificationSocket");

function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.onAny((event, data) => {
      console.log(`[${socket.id}] Event: ${event}`, data);
    });

    // Register socket handlers
    registerVitalsHandlers(socket, io);
    registerNotificationHandlers(socket, io);

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

module.exports = initSocket;