const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/NotificationController');
const { authenticateToken } = require('../middleware/authMiddleware');

//note:
//لما الفلاتر يطلب 
//GET /api/notifications/ لازم يحط التوكن في الهيدر.




/**
 * @route   GET /api/notifications/
 * @desc    Get notifications for the currently logged-in user
 * @access  Protected
 */
router
    .route('/')
    .get(
        authenticateToken,
        NotificationController.getMyNotifications
    );

/**
 * @route   PATCH /api/notifications/:id/seen
 * @desc    Mark a specific notification as seen
 * @access  Protected
 */
router
    .route('/:id/seen')
    .patch(
        authenticateToken,
        NotificationController.markAsSeen
    );

/**
 * @route   POST /api/notifications/
 * @desc    Create/send a system-triggered notification (like appointment or vitals)
 * @access  Protected
 */
router
    .route('/')
    .post(
        authenticateToken,
        NotificationController.createNotification
    );

/**
 * @route   POST /api/notifications/general
 * @desc    Send general/greeting/system notification (used by system itself)
 * @access  Protected
 */
router
    .route('/general')
    .post(
        authenticateToken,
        NotificationController.sendGeneral
    );

router
    .route('/:id')
    .get(
        authenticateToken
        ,NotificationController.getNotificationById
    );

module.exports = router;