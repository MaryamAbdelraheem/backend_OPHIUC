const ApiError = require('../utils/errors/ApiError');
const { Notification } = require('../models');
const NotificationService = require('../services/NotificationService');
const asyncHandler = require('express-async-handler')
const notificationRepository = require('../repositories/notificationRepositry');

/**
 * @method POST
 * @route /api/v1/notifications
 * @desc Create automatic system notification
 * @access protected (token required)
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
 * @route /api/v1/notifications
 * @desc Get current user's notifications
 * @access Protected (token required)
 */
exports.getMyNotifications = asyncHandler(async (req, res) => {
  const userId = req.user.id; // Extracted from auth middleware

  const notifications = await notificationRepository.findAllByRecipientId(userId);

  res.status(200).json({
    status: 'success',
    data: {
      notifications,
    },
  });
});

/**
 * @method GET
 * @route /api/notifications/:id
 * @desc Get current user's notification by id
 * @access protected (token required)
 */
exports.getNotificationById = asyncHandler(async (req, res, next) => {
  const notificationId = req.params.id;
  const userId = req.user.id;

  const notification = await notificationRepository.findByIdForUser(notificationId, userId);

  if (!notification) {
    return next(new ApiError('Notification not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      notification,
    },
  });
});




/**
 * @method PATCH
 * @route /api/v1/notifications/:id/seen
 * @desc Mark a notification as seen
 * @access protected (token required)
 */
exports.markAsSeen = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const notification = await notificationRepository.findById(id);

  if (!notification) {
    return next(new ApiError('Notification not found', 404));
  }

  await notificationRepository.markAsSeen(notification);

  res.status(200).json({
    status: 'success',
    message: 'Notification marked as seen',
  });
});

/**
 * @method POST
 * @route /api/v1/notifications/general
 * @desc Send a general notification (e.g. greeting, system message)
 * @access protected (token required)
 */
exports.sendGeneral = asyncHandler(async (req, res) => {
  const { recipient_id, type = 'GREETING', target_app } = req.body;

  const notification = await NotificationService.send({
    type,
    recipient_id,
    context_type: 'NONE',
    context_id: null,
    target_app,
  });

  res.status(201).json({
    status: 'success',
    data: {
      notification,
    },
  });
});