const { Notification } = require('../models');
const NotificationService = require('../services/NotificationService');
const asyncHandler = require('express-async-handler')
/**
 * @method POST
 * @route /api/notifications/
 * @desc Create automatic system notification
 * @access Protected (token required)
 */
exports.createNotification = asyncHandler(async (req, res) => {

  const notification = await NotificationService.send(req.body);
  res.status(201).json({
    status: "success",
    data: {
      notification
    }
  });

});

/**
 * @method GET
 * @route /api/notifications/
 * @desc Get current user's notifications
 * @access Protected (token required)
 */
exports.getMyNotifications = asyncHandler(async (req, res) => {
  const userId  = req.user.id; // Extracted from auth middleware
  
  const notifications = await Notification.findAll({
    where: { recipient_id: userId },
    order: [['createdAt', 'DESC']]
  });

  res.json({
    status: 'success',
    data: {
      notifications
    }
  });
});

/**
 * @method GET
 * @route /api/notifications/:id
 * @desc Get current user's notification by id
 * @access Protected (token required)
 */
exports.getNotificationById = asyncHandler(async (req, res) => {
  const notificationId = req.params.id;
  const userId = req.user.id; // تأكد إن المستخدم هو اللي له الإشعار

  const notification = await Notification.findOne({
    where: {
      notification_id: notificationId,
      recipient_id: userId  // عشان الأمان
    }
  });

  if (!notification) {
    return res.status(404).json({
      status: 'fail',
      message: 'Notification not found'
    });
  }

  res.json({
    status: 'success',
    data: {
      notification
    }
  });
});




/**
 * @method PATCH
 * @route /api/notifications/:id/seen
 * @desc Mark a notification as seen
 * @access Protected (token required)
 */
exports.markAsSeen = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const notification = await Notification.findByPk(id);

  if (!notification)
    return res.status(404).json({ message: 'Notification not found' });

  notification.seen = true;
  await notification.save();

  res.json({
    status: 'success',
    message: 'Notification marked as seen'
  });
});

/**
 * @method POST
 * @route /api/notifications/general
 * @desc Send a general notification (e.g. greeting, system message)
 * @access Protected (token required)
 */
exports.sendGeneral = asyncHandler(async (req, res) => {
  const { recipient_id, type = 'GREETING', target_app } = req.body;

  const notification = await NotificationService.send({
    type,
    recipient_id,
    context_type: 'NONE',
    context_id: null,
    target_app
  });
  res.status(201).json({
    status: 'success',
    data: {
      notification
    }
  });
});