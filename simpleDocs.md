Of course. Based on the detailed analysis of the `backend_OPHIUC.git` repository, here is a comprehensive documentation file. This document expands upon the existing `Docs.md` with greater detail drawn from the source code, providing a thorough guide for developers and stakeholders.

---

# **Ophiuchus Health Monitoring - Backend Documentation**

## 1. Overview

This document provides a comprehensive guide to the **Ophiuchus Health Monitoring backend system**. This project is a robust, scalable, and real-time backend designed to power a sophisticated health monitoring application focused on tracking patient vitals, with a special emphasis on sleep apnea.

The system establishes a seamless connection between patients and their assigned doctors, processes real-time vital signs from IoT medical devices, and leverages an external **Artificial Intelligence (AI) service** for predictive analysis, treatment recommendations, and health reporting.

The architecture is built on a modern technology stack including Node.js, Express.js, Sequelize, MySQL, Redis, Firebase, and Socket.IO, ensuring efficiency and real-time responsiveness.

### **User Roles**

The system is designed with three distinct user roles:

*   **Patient**: The end-user whose health is being monitored. They can manage their profile, bind monitoring devices, view appointments, and receive AI-generated health reports.
*   **Doctor**: A healthcare professional responsible for monitoring patients. They can view patient data, schedule appointments, and utilize advanced AI tools for diagnosis and treatment planning.
*   **Admin**: A system administrator who manages the platform's integrity, with primary responsibilities including the addition and removal of doctor accounts.

## 2. System Architecture

The backend operates on a service-oriented architecture, with several key data flows:

1.  **Standard API Flow**: Client applications (patient/doctor apps) communicate with the server via a RESTful API. Requests are handled by Express.js, authenticated using JWT, and processed by controllers that interact with the MySQL database via the Sequelize ORM.
2.  **Real-time Vitals Pipeline**:
    *   IoT devices push raw vital signs to a **Firebase Realtime Database**.
    *   The `vitalsController.js` listens for new data (`child_added` event) on Firebase.
    *   Upon receiving data, the server saves it to the MySQL database and simultaneously broadcasts it to connected clients (e.g., a doctor's dashboard) via **Socket.IO**.
3.  **AI Integration Flow**: The `aiService.js` acts as a client for an external AI server. It sends patient data to the AI service to receive predictions, treatment plans, or full reports, which are then relayed back to the user.
4.  **Intelligent Alerting Flow**: The `aiController.js` uses **Redis** as a fast in-memory counter. When the AI predicts a "Severe" condition, a counter for that patient is incremented. If this count reaches a predefined threshold (e.g., 5 times in 15 minutes), a critical alert is pushed to Firebase, which can trigger real-time notifications.
5.  **Vitals Buffering**: For efficiency, another service (`firebaseVitalsService.js`) can buffer incoming vitals into a Redis list. A scheduled background task (`tasks/flushBufferedVitals.js`) runs every 30 minutes to process, average, and persist this buffered data into the main MySQL database.

## 3. Technology Stack

| Category                  | Technology                                                              | Purpose                                                       |
| ------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------- |
| **Backend Framework**     | Node.js, Express.js                                                     | Core application logic, routing, and middleware.              |
| **Database**              | MySQL                                                                   | Primary data persistence for users, vitals, appointments.     |
| **ORM**                   | Sequelize                                                               | Object-Relational Mapping for interacting with MySQL.         |
| **Real-time Communication** | Socket.IO, Firebase Realtime Database                                   | Pushing live data (vitals, notifications) to clients.         |
| **In-Memory Data Store**  | Redis                                                                   | JWT blacklisting, rate limiting, and vitals buffering/counting. |
| **Authentication**        | JSON Web Token (JWT), bcrypt.js                                         | Secure token-based authentication and password hashing.       |
| **API Documentation**     | Swagger (swagger-jsdoc, swagger-ui-express)                           | Generating and serving interactive API documentation.         |
| **HTTP Client**           | Axios                                                                   | Communicating with the external AI service.                   |
| **Validation**            | express-validator                                                       | Validating and sanitizing incoming request data.              |
| **Async Handling**        | express-async-handler                                                   | Simplifying error handling in asynchronous route handlers.     |
| **Environment**           | dotenv, cross-env                                                       | Managing environment variables and cross-platform scripts.    |

## 4. Database Schema and Models

The database schema is defined using Sequelize models, with clear relationships established in `models/associationsModel.js`.

*   **Doctor**: Stores doctor information (name, email, specialization).
*   **Patient**: Stores patient profile data (name, email, medical history, etc.).
*   **Appointment**: Manages scheduled appointments.
*   **Device**: Represents the physical monitoring device, linked by a `serialNumber`.
*   **Vitals**: Stores time-series vital sign records.
*   **Notification**: Stores records of all in-app notifications.

**Key Relationships:**

*   `Doctor` **has many** `Patient`s.
*   `Doctor` and `Patient` **have many** `Appointment`s.
*   `Patient` **has many** `Device`s.
*   `Patient` and `Device` **have many** `Vitals` records.
*   `Patient` and `Doctor` **have many** `Notification`s.

## 5. Features in Detail

### User & Authentication

*   **Role-Based Access Control (RBAC)**: The `authorizeRoles` middleware protects endpoints, ensuring that only users with specific roles (e.g., 'admin', 'doctor') can access them.
*   **JWT Authentication**: The `authenticateToken` middleware secures routes. Upon logout, the JWT is added to a Redis blacklist to prevent its reuse until it expires.
*   **Secure Password Handling**: Passwords are encrypted using `bcrypt.js`. The system also includes secure "Forgot Password" and "Reset Password" flows using crypto tokens stored temporarily in Redis.

### Admin Functionality

*   **Doctor Management**: Admins have exclusive access to add new doctors and view or soft-delete existing ones. Soft deletion (using `paranoid: true` in the model) preserves data for potential recovery.

### Doctor Functionality

*   **Patient Monitoring**: Doctors can view a list of their assigned patients and access detailed profiles and vital sign history.
*   **Appointment Scheduling**: Doctors can create appointments for their patients, which automatically triggers an in-app notification to the patient.
*   **AI-Powered Diagnosis**: Doctors can request AI-driven predictions, treatment plans, and comprehensive reports for their patients, aiding in clinical decision-making.

### Patient Functionality

*   **Profile & Device Management**: Patients can update their profiles and link their monitoring devices via a unique `serialNumber`.
*   **Data Access**: Patients can view their upcoming appointments and access their own AI-generated health reports and treatment plans.

### Real-time System

*   **Live Vitals Feed**: The system provides a live feed of vital signs by listening to Firebase and broadcasting new data over WebSockets, enabling real-time dashboards.
*   **Notification System**: The `NotificationService` is a centralized module for creating and sending various types of notifications (e.g., new appointments, health alerts) which are persisted in the database and can be delivered in-app.

## 6. API Endpoints

The API is versioned under `/api/v1/`. All protected routes require a `Bearer <token>` in the `Authorization` header.

### Authentication (`/auth`)

| Method | Endpoint          | Description                                | Access         |
| :----- | :---------------- | :----------------------------------------- | :------------- |
| `POST` | `/signup`         | Registers a new patient.                   | Public         |
| `POST` | `/login`          | Authenticates an admin, doctor, or patient. | Public         |
| `POST` | `/logout`         | Logs out a user by blacklisting their JWT. | Patient, Doctor |
| `POST` | `/forgot-password` | Sends a password reset link to the user's email. | Public         |
| `POST` | `/reset-password` | Resets the password using a token.         | Public         |
| `POST` | `/change-password` | Changes the password for a logged-in user. | Patient, Doctor |

### Admin (`/admin`)

| Method   | Endpoint             | Description                           | Access |
| :------- | :------------------- | :------------------------------------ | :----- |
| `GET`    | `/users/doctors`     | Retrieves a list of all doctors.      | Admin  |
| `POST`   | `/users/doctors`     | Adds a new doctor to the system.      | Admin  |
| `DELETE` | `/users/doctors/:id` | Soft-deletes a doctor by their ID.    | Admin  |

### Doctors (`/doctors`)

| Method | Endpoint                       | Description                                  | Access |
| :----- | :----------------------------- | :------------------------------------------- | :----- |
| `GET`  | `/:id`                         | Gets a doctor's public profile.              | Doctor |
| `GET`  | `/:id/patients`                | Gets a list of patients assigned to a doctor. | Doctor |
| `GET`  | `/:doctorId/patients/:patientId` | Gets a specific patient's profile.           | Doctor |
| `POST` | `/predict`                     | Requests an AI-based sleep apnea prediction. | Doctor |
| `POST` | `/treatment`                   | Requests an AI-based treatment plan.         | Doctor |
| `POST` | `/full_report`                 | Requests a full AI-generated report.         | Doctor |

### Patients (`/patients`)

| Method | Endpoint   | Description                                  | Access  |
| :----- | :--------- | :------------------------------------------- | :------ |
| `GET`  | `/:id`     | Gets a patient's profile.                    | Patient |
| `PUT`  | `/:id`     | Updates a patient's profile information.     | Patient |
| `POST` | `/predict` | Requests an AI-based sleep apnea prediction. | Patient |
| `POST` | `/treatment`| Requests an AI-based treatment plan.         | Patient |
| `POST` | `/report`  | Requests a summary AI-generated report.      | Patient |

### Other Endpoints

| Method  | Endpoint                | Description                                                 | Access          |
| :------ | :---------------------- | :---------------------------------------------------------- | :-------------- |
| `POST`  | `/appointments`         | Creates a new appointment.                                  | Doctor          |
| `GET`   | `/appointments`         | Gets all appointments for the logged-in user.               | Doctor, Patient |
| `POST`  | `/devices/bind`         | Binds a device (by serial number) to the patient.           | Patient         |
| `GET`   | `/notifications`        | Gets all notifications for the logged-in user.              | Doctor, Patient |
| `PATCH` | `/notifications/:id/seen`| Marks a notification as read.                               | Doctor, Patient |
| `GET`   | `/vitals/last-averaged` | Retrieves the latest vital records from the last 30 minutes. | Patient, Doctor |

## 7. Real-time Events (Socket.IO)

The Socket.IO server provides real-time communication channels. All connections are authenticated using the `socketAuth` middleware.

*   **`connection`**: A client establishes a connection.
*   **`newVitals` (Server -> Client)**: The server emits this event to broadcast new vital sign data. The payload includes `patientId` and the `vitals` object.
    ```json
    {
      "patientId": 12,
      "vitals": {
        "VitalsId": 101,
        "Oxygen_Saturation": 95.5,
        "AHI": 4.2,
        /* ... other vitals fields ... */
      }
    }
    ```

## 8. Setup and Installation

To run this project locally, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd backend_OPHIUC.git
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Create `.env` file:**
    Create a `.env` file in the project root and populate it with your configuration details.

    ```env
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
    JWT_SECRET=your-strong-jwt-secret

    # Redis
    REDIS_URL=redis://localhost:6379

    # Static Admin User
    ADMIN_EMAIL=admin@example.com
    ADMIN_PASSWORD=adminpassword

    # External AI Service
    AI_SERVER_URL=http://your-ai-server-url.com

    # Nodemailer (for password reset)
    EMAIL_USER=your_email@gmail.com
    EMAIL_PASS=your_email_password
    FRONTEND_URL=http://localhost:3000
    ```

4.  **Set up Firebase:**
    *   Create a Firebase project and enable the **Realtime Database**.
    *   Download your Firebase service account key (a JSON file) from *Project settings > Service accounts*.
    *   Place the file in the `config/` directory and rename it to `osahealthmonitor-firebase-adminsdk-fbsvc-f42e920593.json`, or update the filename in `config/firebase.js`.
    *   Ensure the `databaseURL` in `config/firebase.js` matches your Firebase project's URL.

5.  **Start the server:**
    *   For development (with auto-reloading via nodemon):
        ```bash
        npm run start:dev
        ```
    *   For production:
        ```bash
        npm run start:prod
        ```

The server will start, connect to the databases, and begin listening for Firebase events. The interactive API documentation will be available at `http://localhost:8000/api-docs`.Of course. Based on the detailed analysis of the `backend_OPHIUC.git` repository, here is a comprehensive documentation file. This document expands upon the existing `Docs.md` with greater detail drawn from the source code, providing a thorough guide for developers and stakeholders.

---

# **Ophiuchus Health Monitoring - Backend Documentation**

## 1. Overview

This document provides a comprehensive guide to the **Ophiuchus Health Monitoring backend system**. This project is a robust, scalable, and real-time backend designed to power a sophisticated health monitoring application focused on tracking patient vitals, with a special emphasis on sleep apnea.

The system establishes a seamless connection between patients and their assigned doctors, processes real-time vital signs from IoT medical devices, and leverages an external **Artificial Intelligence (AI) service** for predictive analysis, treatment recommendations, and health reporting.

The architecture is built on a modern technology stack including Node.js, Express.js, Sequelize, MySQL, Redis, Firebase, and Socket.IO, ensuring efficiency and real-time responsiveness.

### **User Roles**

The system is designed with three distinct user roles:

*   **Patient**: The end-user whose health is being monitored. They can manage their profile, bind monitoring devices, view appointments, and receive AI-generated health reports.
*   **Doctor**: A healthcare professional responsible for monitoring patients. They can view patient data, schedule appointments, and utilize advanced AI tools for diagnosis and treatment planning.
*   **Admin**: A system administrator who manages the platform's integrity, with primary responsibilities including the addition and removal of doctor accounts.

## 2. System Architecture

The backend operates on a service-oriented architecture, with several key data flows:

1.  **Standard API Flow**: Client applications (patient/doctor apps) communicate with the server via a RESTful API. Requests are handled by Express.js, authenticated using JWT, and processed by controllers that interact with the MySQL database via the Sequelize ORM.
2.  **Real-time Vitals Pipeline**:
    *   IoT devices push raw vital signs to a **Firebase Realtime Database**.
    *   The `vitalsController.js` listens for new data (`child_added` event) on Firebase.
    *   Upon receiving data, the server saves it to the MySQL database and simultaneously broadcasts it to connected clients (e.g., a doctor's dashboard) via **Socket.IO**.
3.  **AI Integration Flow**: The `aiService.js` acts as a client for an external AI server. It sends patient data to the AI service to receive predictions, treatment plans, or full reports, which are then relayed back to the user.
4.  **Intelligent Alerting Flow**: The `aiController.js` uses **Redis** as a fast in-memory counter. When the AI predicts a "Severe" condition, a counter for that patient is incremented. If this count reaches a predefined threshold (e.g., 5 times in 15 minutes), a critical alert is pushed to Firebase, which can trigger real-time notifications.
5.  **Vitals Buffering**: For efficiency, another service (`firebaseVitalsService.js`) can buffer incoming vitals into a Redis list. A scheduled background task (`tasks/flushBufferedVitals.js`) runs every 30 minutes to process, average, and persist this buffered data into the main MySQL database.

## 3. Technology Stack

| Category                  | Technology                                                              | Purpose                                                       |
| ------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------- |
| **Backend Framework**     | Node.js, Express.js                                                     | Core application logic, routing, and middleware.              |
| **Database**              | MySQL                                                                   | Primary data persistence for users, vitals, appointments.     |
| **ORM**                   | Sequelize                                                               | Object-Relational Mapping for interacting with MySQL.         |
| **Real-time Communication** | Socket.IO, Firebase Realtime Database                                   | Pushing live data (vitals, notifications) to clients.         |
| **In-Memory Data Store**  | Redis                                                                   | JWT blacklisting, rate limiting, and vitals buffering/counting. |
| **Authentication**        | JSON Web Token (JWT), bcrypt.js                                         | Secure token-based authentication and password hashing.       |
| **API Documentation**     | Swagger (swagger-jsdoc, swagger-ui-express)                           | Generating and serving interactive API documentation.         |
| **HTTP Client**           | Axios                                                                   | Communicating with the external AI service.                   |
| **Validation**            | express-validator                                                       | Validating and sanitizing incoming request data.              |
| **Async Handling**        | express-async-handler                                                   | Simplifying error handling in asynchronous route handlers.     |
| **Environment**           | dotenv, cross-env                                                       | Managing environment variables and cross-platform scripts.    |

## 4. Database Schema and Models

The database schema is defined using Sequelize models, with clear relationships established in `models/associationsModel.js`.

*   **Doctor**: Stores doctor information (name, email, specialization).
*   **Patient**: Stores patient profile data (name, email, medical history, etc.).
*   **Appointment**: Manages scheduled appointments.
*   **Device**: Represents the physical monitoring device, linked by a `serialNumber`.
*   **Vitals**: Stores time-series vital sign records.
*   **Notification**: Stores records of all in-app notifications.

**Key Relationships:**

*   `Doctor` **has many** `Patient`s.
*   `Doctor` and `Patient` **have many** `Appointment`s.
*   `Patient` **has many** `Device`s.
*   `Patient` and `Device` **have many** `Vitals` records.
*   `Patient` and `Doctor` **have many** `Notification`s.

## 5. Features in Detail

### User & Authentication

*   **Role-Based Access Control (RBAC)**: The `authorizeRoles` middleware protects endpoints, ensuring that only users with specific roles (e.g., 'admin', 'doctor') can access them.
*   **JWT Authentication**: The `authenticateToken` middleware secures routes. Upon logout, the JWT is added to a Redis blacklist to prevent its reuse until it expires.
*   **Secure Password Handling**: Passwords are encrypted using `bcrypt.js`. The system also includes secure "Forgot Password" and "Reset Password" flows using crypto tokens stored temporarily in Redis.

### Admin Functionality

*   **Doctor Management**: Admins have exclusive access to add new doctors and view or soft-delete existing ones. Soft deletion (using `paranoid: true` in the model) preserves data for potential recovery.

### Doctor Functionality

*   **Patient Monitoring**: Doctors can view a list of their assigned patients and access detailed profiles and vital sign history.
*   **Appointment Scheduling**: Doctors can create appointments for their patients, which automatically triggers an in-app notification to the patient.
*   **AI-Powered Diagnosis**: Doctors can request AI-driven predictions, treatment plans, and comprehensive reports for their patients, aiding in clinical decision-making.

### Patient Functionality

*   **Profile & Device Management**: Patients can update their profiles and link their monitoring devices via a unique `serialNumber`.
*   **Data Access**: Patients can view their upcoming appointments and access their own AI-generated health reports and treatment plans.

### Real-time System

*   **Live Vitals Feed**: The system provides a live feed of vital signs by listening to Firebase and broadcasting new data over WebSockets, enabling real-time dashboards.
*   **Notification System**: The `NotificationService` is a centralized module for creating and sending various types of notifications (e.g., new appointments, health alerts) which are persisted in the database and can be delivered in-app.

## 6. API Endpoints

The API is versioned under `/api/v1/`. All protected routes require a `Bearer <token>` in the `Authorization` header.

### Authentication (`/auth`)

| Method | Endpoint          | Description                                | Access         |
| :----- | :---------------- | :----------------------------------------- | :------------- |
| `POST` | `/signup`         | Registers a new patient.                   | Public         |
| `POST` | `/login`          | Authenticates an admin, doctor, or patient. | Public         |
| `POST` | `/logout`         | Logs out a user by blacklisting their JWT. | Patient, Doctor |
| `POST` | `/forgot-password` | Sends a password reset link to the user's email. | Public         |
| `POST` | `/reset-password` | Resets the password using a token.         | Public         |
| `POST` | `/change-password` | Changes the password for a logged-in user. | Patient, Doctor |

### Admin (`/admin`)

| Method   | Endpoint             | Description                           | Access |
| :------- | :------------------- | :------------------------------------ | :----- |
| `GET`    | `/users/doctors`     | Retrieves a list of all doctors.      | Admin  |
| `POST`   | `/users/doctors`     | Adds a new doctor to the system.      | Admin  |
| `DELETE` | `/users/doctors/:id` | Soft-deletes a doctor by their ID.    | Admin  |

### Doctors (`/doctors`)

| Method | Endpoint                       | Description                                  | Access |
| :----- | :----------------------------- | :------------------------------------------- | :----- |
| `GET`  | `/:id`                         | Gets a doctor's public profile.              | Doctor |
| `GET`  | `/:id/patients`                | Gets a list of patients assigned to a doctor. | Doctor |
| `GET`  | `/:doctorId/patients/:patientId` | Gets a specific patient's profile.           | Doctor |
| `POST` | `/predict`                     | Requests an AI-based sleep apnea prediction. | Doctor |
| `POST` | `/treatment`                   | Requests an AI-based treatment plan.         | Doctor |
| `POST` | `/full_report`                 | Requests a full AI-generated report.         | Doctor |

### Patients (`/patients`)

| Method | Endpoint   | Description                                  | Access  |
| :----- | :--------- | :------------------------------------------- | :------ |
| `GET`  | `/:id`     | Gets a patient's profile.                    | Patient |
| `PUT`  | `/:id`     | Updates a patient's profile information.     | Patient |
| `POST` | `/predict` | Requests an AI-based sleep apnea prediction. | Patient |
| `POST` | `/treatment`| Requests an AI-based treatment plan.         | Patient |
| `POST` | `/report`  | Requests a summary AI-generated report.      | Patient |

### Other Endpoints

| Method  | Endpoint                | Description                                                 | Access          |
| :------ | :---------------------- | :---------------------------------------------------------- | :-------------- |
| `POST`  | `/appointments`         | Creates a new appointment.                                  | Doctor          |
| `GET`   | `/appointments`         | Gets all appointments for the logged-in user.               | Doctor, Patient |
| `POST`  | `/devices/bind`         | Binds a device (by serial number) to the patient.           | Patient         |
| `GET`   | `/notifications`        | Gets all notifications for the logged-in user.              | Doctor, Patient |
| `PATCH` | `/notifications/:id/seen`| Marks a notification as read.                               | Doctor, Patient |
| `GET`   | `/vitals/last-averaged` | Retrieves the latest vital records from the last 30 minutes. | Patient, Doctor |

## 7. Real-time Events (Socket.IO)

The Socket.IO server provides real-time communication channels. All connections are authenticated using the `socketAuth` middleware.

*   **`connection`**: A client establishes a connection.
*   **`newVitals` (Server -> Client)**: The server emits this event to broadcast new vital sign data. The payload includes `patientId` and the `vitals` object.
    ```json
    {
      "patientId": 12,
      "vitals": {
        "VitalsId": 101,
        "Oxygen_Saturation": 95.5,
        "AHI": 4.2,
        /* ... other vitals fields ... */
      }
    }
    ```

## 8. Setup and Installation

To run this project locally, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd backend_OPHIUC.git
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Create `.env` file:**
    Create a `.env` file in the project root and populate it with your configuration details.

    ```env
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
    JWT_SECRET=your-strong-jwt-secret

    # Redis
    REDIS_URL=redis://localhost:6379

    # Static Admin User
    ADMIN_EMAIL=admin@example.com
    ADMIN_PASSWORD=adminpassword

    # External AI Service
    AI_SERVER_URL=http://your-ai-server-url.com

    # Nodemailer (for password reset)
    EMAIL_USER=your_email@gmail.com
    EMAIL_PASS=your_email_password
    FRONTEND_URL=http://localhost:3000
    ```

4.  **Set up Firebase:**
    *   Create a Firebase project and enable the **Realtime Database**.
    *   Download your Firebase service account key (a JSON file) from *Project settings > Service accounts*.
    *   Place the file in the `config/` directory and rename it to `osahealthmonitor-firebase-adminsdk-fbsvc-f42e920593.json`, or update the filename in `config/firebase.js`.
    *   Ensure the `databaseURL` in `config/firebase.js` matches your Firebase project's URL.

5.  **Start the server:**
    *   For development (with auto-reloading via nodemon):
        ```bash
        npm run start:dev
        ```
    *   For production:
        ```bash
        npm run start:prod
        ```

The server will start, connect to the databases, and begin listening for Firebase events. The interactive API documentation will be available at `http://localhost:8000/api-docs`.