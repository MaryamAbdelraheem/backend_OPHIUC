// 1. Core & External Modules
const express = require("express");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

// 2. Config & Database
const sequelize = require("./config/database");
require("./models/associationsModel");

// 3. Swagger (API Docs)
const { swaggerUi, swaggerSpec } = require('./config/swagger');

// Express App Setup
const app = express();

// Error Middleware 
const { globalErrorHandler, notFoundHandler } = require("./middleware/errorMiddleware");

// Routes
const authRoutes = require('./routes/authRoute');
const adminRoutes = require("./routes/adminRoute");
const doctorRoutes = require("./routes/doctorRoute");
const patientRoutes = require("./routes/patientRoute");
const appointmentRoutes = require("./routes/appointmentRoute");
const notificationRoutes = require("./routes/notificationRoute");
const deviceRoutes = require("./routes/deviceRoute");
const vitalsRoutes = require("./routes/vitalsRoute");

// Firebase listener
const { listenToFirebaseVitals } = require("./controllers/vitalsController");


app.use(cors({
  origin: "*", // Allow all origins (change in production)
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/doctors", doctorRoutes);
app.use("/api/v1/patients", patientRoutes);
app.use("/api/v1/appointments", appointmentRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/devices", deviceRoutes);
app.use("/api/v1/vitals", vitalsRoutes);

// 6. Error Handling Middleware
app.use(notFoundHandler);
app.use(globalErrorHandler);

// Server + WebSocket
const server = http.createServer(app);
const initSocket = require("./socket");

// Start Server
sequelize.sync({ force: false })
  .then(() => {
    const port = process.env.PORT || 8000;
    server.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });

    // Init WebSocket
    initSocket(server);

    // Start listening to Firebase
    listenToFirebaseVitals();
  })
  .catch((err) => {
    console.error("Failed to start server:", err);
  });
