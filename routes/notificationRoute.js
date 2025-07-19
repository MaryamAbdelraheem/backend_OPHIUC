const express = require('express');
const router = express.Router();
const { getMyNotifications, markAsSeen, createNotification, sendGeneral, getNotificationById } = require('../controllers/NotificationController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

/**
 * @route   GET /api/v1/notifications
 * @desc    Get notifications for the currently logged-in user
 * @access  protected
 */
router
    .route('/')
    .get(
        authenticateToken,
        authorizeRoles('doctor', 'patient'),
        getMyNotifications
    );

/**
 * @route   PATCH /api/v1/notifications/:id/seen
 * @desc    Mark a specific notification as seen
 * @access  protected
 */
router
    .route('/:id/seen')
    .patch(
        authenticateToken,
        markAsSeen
    );

/**
 * @route   POST /api/v1/notifications/
 * @desc    Create/send a system-triggered notification (like appointment or vitals)
 * @access  protected
 */
router
    .route('/')
    .post(
        authenticateToken,
        createNotification
    );

/**
 * @route   POST /api/v1/notifications/general
 * @desc    Send general/greeting/system notification (used by system itself)
 * @access  protected
 */
router
    .route('/general')
    .post(
        authenticateToken,
        authorizeRoles("patient", 'doctor'),
        sendGeneral
    );
/**
 * @route   GET /api/v1/notifications/:id
 * @desc    Get Notification by id
 * @access  private
 */
router
    .route('/:id')
    .get(
        authenticateToken,
        getNotificationById
    );

module.exports = router;