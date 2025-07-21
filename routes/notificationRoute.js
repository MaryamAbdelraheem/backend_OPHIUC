const express = require('express');
const router = express.Router();
const {
    getMyNotifications,
    markAsSeen,
    createNotification,
    sendGeneral,
    getNotificationById
} = require('../controllers/NotificationController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');




router
    .route('/')
    .get(
        authenticateToken,
        authorizeRoles('doctor', 'patient'),
        getMyNotifications
    );


router
    .route('/')
    .post(
        authenticateToken,
        createNotification
    );


router
    .route('/:id/seen')
    .patch(
        authenticateToken,
        markAsSeen
    );


router
    .route('/general')
    .post(
        authenticateToken,
        authorizeRoles("patient", 'doctor'),
        sendGeneral
    );


router
    .route('/:id')
    .get(
        authenticateToken,
        getNotificationById
    );

module.exports = router;


