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

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: User notifications management
 */

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Get notifications for the logged-in user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of notifications
 *       401:
 *         description: Unauthorized
 */
router
    .route('/')
    .get(
        authenticateToken,
        authorizeRoles('doctor', 'patient'),
        getMyNotifications
    );

/**
 * @swagger
 * /notifications:
 *   post:
 *     summary: Create a system-triggered notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *               - receiverId
 *               - type
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               receiverId:
 *                 type: integer
 *               type:
 *                 type: string
 *                 example: "appointment"
 *     responses:
 *       201:
 *         description: Notification created successfully
 */
router
    .route('/')
    .post(
        authenticateToken,
        createNotification
    );

/**
 * @swagger
 * /notifications/{id}/seen:
 *   patch:
 *     summary: Mark a notification as seen
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification marked as seen
 *       404:
 *         description: Notification not found
 */
router
    .route('/:id/seen')
    .patch(
        authenticateToken,
        markAsSeen
    );

/**
 * @swagger
 * /notifications/general:
 *   post:
 *     summary: Send a general system notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: General notification sent
 */
router
    .route('/general')
    .post(
        authenticateToken,
        authorizeRoles("patient", 'doctor'),
        sendGeneral
    );

/**
 * @swagger
 * /notifications/{id}:
 *   get:
 *     summary: Get a notification by ID
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification data
 *       404:
 *         description: Notification not found
 */
router
    .route('/:id')
    .get(
        authenticateToken,
        getNotificationById
    );

module.exports = router;


// const express = require('express');
// const router = express.Router();
// const { getMyNotifications, markAsSeen, createNotification, sendGeneral, getNotificationById } = require('../controllers/NotificationController');
// const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

// /**
//  * @route   GET /api/v1/notifications
//  * @desc    Get notifications for the currently logged-in user
//  * @access  protected
//  */
// router
//     .route('/')
//     .get(
//         authenticateToken,
//         authorizeRoles('doctor', 'patient'),
//         getMyNotifications
//     );

// /**
//  * @route   PATCH /api/v1/notifications/:id/seen
//  * @desc    Mark a specific notification as seen
//  * @access  protected
//  */
// router
//     .route('/:id/seen')
//     .patch(
//         authenticateToken,
//         markAsSeen
//     );

// /**
//  * @route   POST /api/v1/notifications/
//  * @desc    Create/send a system-triggered notification (like appointment or vitals)
//  * @access  protected
//  */
// router
//     .route('/')
//     .post(
//         authenticateToken,
//         createNotification
//     );

// /**
//  * @route   POST /api/v1/notifications/general
//  * @desc    Send general/greeting/system notification (used by system itself)
//  * @access  protected
//  */
// router
//     .route('/general')
//     .post(
//         authenticateToken,
//         authorizeRoles("patient", 'doctor'),
//         sendGeneral
//     );
// /**
//  * @route   GET /api/v1/notifications/:id
//  * @desc    Get Notification by id
//  * @access  private
//  */
// router
//     .route('/:id')
//     .get(
//         authenticateToken,
//         getNotificationById
//     );

// module.exports = router;