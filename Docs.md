Ophiuchus Health Monitoring Backend
1. Overview

This document provides a comprehensive overview of the backend_OPHIUC.git repository. This project is the backend system for a sophisticated health monitoring application, likely named "Ophiuchus Health," designed to track patient vitals, with a specific focus on sleep apnea.

The system facilitates a connection between patients and doctors, processes real-time vital signs from medical devices, and integrates with an external Artificial Intelligence (AI) service. This AI provides predictive analysis, treatment recommendations, and detailed health reports. The architecture is built to be scalable and real-time, using modern technologies like Node.js, WebSockets, and Firebase.

There are three primary user roles within the system:

Patient: The end-user whose health is being monitored. They can manage their profile, bind monitoring devices, view appointments, and receive AI-generated reports about their condition.

Doctor: A healthcare professional who monitors patients, views their data and profiles, schedules appointments, and utilizes advanced AI tools for diagnosis and treatment planning.

Admin: A system administrator responsible for managing the platform, primarily by adding and removing doctor accounts.

2. Features
User & Authentication

Role-Based Access Control: Secure endpoints for Admins, Doctors, and Patients.

JWT Authentication: User authentication is handled via JSON Web Tokens, with a blacklist feature using Redis to manage logouts.

Patient Signup: New patients can register, linking to a specific doctor.

Unified Login: A single login endpoint for all roles (Admin, Doctor, Patient).

Admin Functionality

Doctor Management: Admins can add, view, and soft-delete doctor profiles from the system.

Doctor Functionality

Patient Management: Doctors can view a list of their assigned patients and access individual patient profiles.

Appointment Scheduling: Doctors can create new appointments for their patients.

AI Integration:

Request sleep apnea predictions.

Generate treatment plans.

Generate full, detailed patient reports.

Patient Functionality

Profile Management: Patients can view and update their personal and medical information.

Device Management: Patients can bind a physical monitoring device to their account using its serial number (e.g., from a QR code scan).

Appointment Viewing: Patients can see a list of their upcoming appointments, including doctor details.

AI Integration:

Request sleep apnea predictions based on their data.

Receive treatment recommendations.

Generate a summary report of their health status.

Real-time Vitals & Notifications

Firebase Integration: The system listens to a Firebase Realtime Database for new vital signs data pushed from monitoring devices.

Real-time Vitals Feed: Vitals are processed and broadcast to relevant clients (doctors/patients) in real-time using Socket.IO.

Alerting System: The system uses Redis to count consecutive "Severe" sleep apnea predictions and sends a real-time alert to Firebase after a certain threshold is met.

In-App Notification System: A comprehensive notification system that creates and delivers alerts for events like new appointments, system messages, and health alerts.

3. Technology Stack

Backend Framework: Express.js

Language: Node.js (CommonJS)

Database: MySQL (inferred from mysql2 driver and Sequelize dialect)

ORM: Sequelize

Authentication: JSON Web Token (JWT)

Real-time Communication: Socket.IO, Firebase Realtime Database

In-Memory Data Store: Redis (used for JWT blacklisting and buffering vital signs)

HTTP Client: Axios (for communicating with the external AI service)

Validation: express-validator

Async Handling: express-async-handler

Environment Management: dotenv

4. Project Structure

The repository is organized into a modular structure that separates concerns, making it maintainable and scalable.

Directory	Purpose
config/	Contains configuration files for connecting to databases (Sequelize/MySQL), Firebase, and Redis.
controllers/	Handles the business logic for incoming HTTP requests. It acts as the bridge between routes and models/services.
middleware/	Contains custom middleware functions for tasks like authentication (authMiddleware), error handling (errorMiddleware), input validation (validateRequest), and rate limiting.
models/	Defines the database schemas and their relationships (associations) using Sequelize.
routes/	Defines the API endpoints and maps them to the appropriate controller functions.
services/	Encapsulates logic for interacting with external services, such as the AI service (aiService) and the notification system (NotificationService).
socket/	Manages WebSocket (Socket.IO) connections and real-time event handling.
tasks/	Contains background jobs or scheduled tasks, such as flushing buffered vitals from Redis to the main database.
utils/	Provides helper functions, custom error classes (ApiError), and static data maps (genderMap).
validators/	Defines validation and sanitization rules for incoming request data using express-validator.
app.js	The main entry point of the application. It initializes the Express server, sets up middleware, mounts routes, and starts the server.
package.json	Lists project dependencies, scripts, and metadata.
5. API Endpoints

Below is a summary of the available API endpoints grouped by functionality.

Authentication (/api/v1/auth)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| POST | /signup | Registers a new patient. | Public |
| POST | /login | Authenticates an admin, doctor, or patient. | Public |
| POST | /logout | Logs out a user by blacklisting their JWT. | Patient, Doctor |

Admin (/api/v1/admin)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| GET | /users/doctors | Retrieves a list of all doctors. | Admin |
| POST | /users/doctors | Adds a new doctor to the system. | Admin |
| DELETE| /users/doctors/:id | Soft-deletes a doctor by their ID. | Admin |

Doctors (/api/v1/doctors)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| GET | /:id | Gets a doctor's public profile. | Doctor |
| GET | /:id/patients | Gets a list of patients assigned to a doctor. | Doctor |
| GET | /:doctorId/patients/:patientId | Gets a specific patient's profile for the doctor. | Doctor |
| POST | /predict | Requests an AI-based sleep apnea prediction. | Doctor |
| POST | /treatment | Requests an AI-based treatment plan. | Doctor |
| POST | /full_report | Requests a full, detailed AI-generated report. | Doctor |

Patients (/api/v1/patients)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| GET | /:id | Gets a patient's profile. | Patient |
| PUT | /:id | Updates a patient's profile information. | Patient |
| POST | /predict | Requests an AI-based sleep apnea prediction. | Patient |
| POST | /treatment | Requests an AI-based treatment plan. | Patient |
| POST | /report | Requests a summary AI-generated report. | Patient |

Appointments (/api/v1/appointments)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| POST | / | Creates a new appointment for a patient. | Doctor |
| GET | / | Gets all appointments for the logged-in user. | Doctor, Patient |

Devices (/api/v1/devices)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| POST | /bind | Binds a device (by serial number) to the logged-in patient. | Patient |

Notifications (/api/v1/notifications)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| GET | / | Gets all notifications for the logged-in user. | Doctor, Patient |
| GET | /:id | Gets a specific notification by its ID. | Doctor, Patient |
| PATCH | /:id/seen | Marks a notification as read. | Doctor, Patient |

Vitals (/api/v1/vitals)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| GET | /last-averaged | Retrieves the latest vital records from the last 30 minutes. | Patient, Doctor |

6. Setup and Installation

To run this project locally, follow these steps:

Clone the repository:

Generated bash
git clone <repository_url>
cd backend_OPHIUC.git


Install dependencies:

Generated bash
npm install
IGNORE_WHEN_COPYING_START
content_copy
download
Use code with caution.
Bash
IGNORE_WHEN_COPYING_END

Create a .env file:
Create a file named .env in the root of the project and add the following environment variables. Replace the placeholder values with your actual configuration.

Generated env
# Server Configuration
PORT=8000
NODE_ENV=development

# Database (MySQL)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=ophiuchus_db
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DIALECT=mysql

# JWT
JWT_SECRET=ophiucs-project-secret-jwt

# Redis
REDIS_URL=redis://localhost:6379

# Static Admin User
ADMIN_EMAIL=admin@ophiuchus.com
ADMIN_PASSWORD=adminpassword

# External AI Service
AI_SERVER_URL=http://your-ai-server-url.com
IGNORE_WHEN_COPYING_START
content_copy
download
Use code with caution.
Env
IGNORE_WHEN_COPYING_END

Set up Firebase:

You will need a Firebase project with the Realtime Database enabled.

Download your Firebase service account key JSON file and place it in the config/ directory. The code expects it to be named osahealthmonitor-firebase-adminsdk-fbsvc-f42e920593.json.

Update the databaseURL in config/firebase.js if it differs.

Start the server:

For development with auto-reloading:

Generated bash
npm run start:dev
IGNORE_WHEN_COPYING_START
content_copy
download
Use code with caution.
Bash
IGNORE_WHEN_COPYING_END

For production:

Generated bash
npm run start:prod
IGNORE_WHEN_COPYING_START
content_copy
download
Use code with caution.
Bash
IGNORE_WHEN_COPYING_END

The server should now be running on the port specified in your .env file.

Google Search Suggestions
Display of Search Suggestions is required when using Grounding with Google Search. Learn more
Ophiuchus Health Monitoring Backend documentation
backend_OPHIUC.git project documentation