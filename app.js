// ======================
// External Modules
// ======================
const express = require("express");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");

dotenv.config();

// ======================
// Internal Modules
// ======================
const sequelize = require("./utils/database");
require("./models/associationsModel"); // العلاقات بين الموديلات

const { getAdminByEmail } = require("./models/adminModel");
const { generateToken, authenticateToken } = require("./middleware/authMiddleware");
const { globalErrorHandler, notFoundHandler } = require("./middleware/errorMiddleware");

// ======================
// Routes
// ======================
const adminRoutes = require("./routes/adminRoute");
const doctorRoutes = require("./routes/doctorRoute");
const patientRoutes = require("./routes/patientRoute");
const appointmentRoutes = require("./routes/appointmentRoute");
const notificationRoutes = require("./routes/notificationRoute");
const vitalsRoutes = require("./routes/vitalsRoute");
const aiRoutes = require("./routes/aiRoute");

// ======================
// Express App Setup
// ======================
const app = express();

app.use(cors({
  origin: "*", // 🔒 يفضل تحددي الأصل الحقيقي في الإنتاج
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ======================
// API Routes
// ======================
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/doctors", doctorRoutes);
app.use("/api/v1/patients", patientRoutes);
app.use("/api/v1/appointments", appointmentRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/vitals", vitalsRoutes);
app.use("/api/v1/ai", aiRoutes);

// ======================
// ⚠️ Error Handling
// ======================
app.use(notFoundHandler);
app.use(globalErrorHandler);

// ======================
// Server + WebSocket
// ======================
const server = http.createServer(app);
const initSocket = require("./socket");

// ======================
// Start Server
// ======================
sequelize.sync({ force: false })
  .then(() => {
    const port = process.env.PORT || 8000;
    server.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });

    initSocket(server);
  })
  .catch((err) => {
    console.error(" Failed to start server:", err);
  });