const { Server } = require("socket.io");
const registerNotificationHandlers = require("./notificationSocket");
const socketAuth = require('../middleware/socketAuth');

function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // JWT authentication middleware
  io.use(socketAuth);

  // Save io to global object so background tasks can use it
  global.io = io;

  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.onAny((event, data) => {
      console.log(`[${socket.id}] Event: ${event}`, data);
    });

    // ✅ Notification system
    registerNotificationHandlers(socket, io);

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

module.exports = initSocket;
