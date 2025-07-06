const express = require("express");
require("dotenv").config();
const cors = require("cors");
const bodyParser = require("body-parser");
const http = require("http");
const bcrypt = require("bcrypt");
const { getAdminByEmail } = require("./models/adminModel");
const { generateToken, authenticateToken } = require("./middleware/authMiddleware");
const {errorHandler, notFoundHandler} = require('./middleware/errorHandler');

// استيراد العلاقات
require('./models/associationsModel');
const sequelize = require('./util/database')

// import routes app
const adminRoutes = require('./routes/adminRoute');
const doctorRoutes = require('./routes/doctorRoute');
const patientRoutes = require('./routes/patientRoute');
const appointmentRoutes = require('./routes/appointmentRoute');
const notificationRoutes = require('./routes/notificationRoute'); 
const vitalsRoutes = require('./routes/vitalsRoute'); 

//console.log("JWT_SECRET:", process.env.JWT_SECRET);
//console.log("JWT_EXPIRES_IN:", process.env.JWT_EXPIRES_IN);

// dotenv.config(); // Load environment variables

const app = express();
app.use(cors());
app.use(express.json());  // لتحليل طلبات JSON
app.use(express.urlencoded({ extended: true })); // لتحليل بيانات النماذج



// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/appointment', appointmentRoutes);
app.use('/api/notifications', notificationRoutes); 
app.use('/api/vitals', vitalsRoutes); 


const server = http.createServer(app);
const initSocket = require("./socket");

// Error handler and handler not found
/*app.use(notFoundHandler);
app.use(errorHandler);*/


sequelize.sync({ force: false})
  .then(() => {
    const port = process.env.PORT || 8000;
    server.listen(port, () => {
      console.log(`Running server on port ${port}`);
    });

    initSocket(server);
  })
  .catch(err => {
    console.error('Failed to start server:', err);
  });

// /////////////////////////////////////////
// sequelize.sync({ force: false}) // Set to `true` to drop and re-create tables (use with caution!)
//   .then(() => {
//     const server = http.createServer(app); // Create HTTP server from Express app

//     const port = process.env.PORT || 8000; // Use port 4000 as per your Flutter app's ApiService and SocketService
//     server.listen(port, () => {
//       console.log(`Running server on port ${port}`);
//     });

//     // Initialize Socket.IO with the HTTP server and CORS options
//     const io = socketIO(server, {
//         cors:{
//             origin: "*", // Allow all origins for development
//             methods :["GET" , "POST"],
//             credentials: true // Allow cookies to be sent
//         }
//     });

//     // Socket.IO event handling
//     io.on('connection', socket => {
//         console.log(`Client connected: ${socket.id}`);

//         // Listen for any event from this specific client socket
//         socket.onAny((event, data) => {
//             console.log(`[Socket ${socket.id}] Event: ${event} | Data:`, data);
//         });

//         // Respond to 'test' event from Flutter
//         socket.on('test', (data) => {
//             console.log(`[Socket ${socket.id}] Received 'test' from Flutter:`, data);
//             socket.emit('reply', { msg: 'Test received by server', from: 'server' });
//         });

//         // Example: Emit sensor data every 2 seconds to connected clients
//         // Replace with your actual sensor data source
//         const sensorDataInterval = setInterval(() => {
//             const dummySensorData = {
//                 // Ensure these are numbers, not strings from .toFixed()
//                 "temperature_mpu": parseFloat((Math.random() * 5 + 25).toFixed(2)), // Explicitly parse to float
//                 "temperature_body": parseFloat((Math.random() * 2 + 36).toFixed(2)), // Explicitly parse to float
//                 "bpm": Math.floor(Math.random() * 30 + 60), // Already an integer
//                 "ir": Math.floor(Math.random() * 10000) + 50000, // Already an integer
//                 "bp_est": parseFloat((Math.random() * 20 + 80).toFixed(1)), // Explicitly parse to float
//                 "accelerometer": {
//                     "x": parseFloat((Math.random() * 0.1 - 0.05).toFixed(4)),
//                     "y": parseFloat((Math.random() * 0.1 - 0.05).toFixed(4)),
//                     "z": parseFloat((Math.random() * 0.5 + 9.5).toFixed(4))
//                 },
//                 "gyroscope": [
//                     parseFloat((Math.random() * 0.01 - 0.005).toFixed(4)),
//                     parseFloat((Math.random() * 0.01 - 0.005).toFixed(4)),
//                     parseFloat((Math.random() * 0.01 - 0.005).toFixed(4))
//                 ]
//             };
//             socket.emit('sensor_data', dummySensorData); // Emit to this specific socket
//         }, 2000); // Emit every 2 seconds

//         socket.on('disconnect', () => {
//             console.log(`Client disconnected: ${socket.id}`);
//             clearInterval(sensorDataInterval); // Clear interval when client disconnects
//         });
//     });

//   })
//   .catch(err => {
//     console.error('Failed to start server:', err);
//   });
