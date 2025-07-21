const { Notification } = require('../models');

class NotificationRepository {
  async create(notificationData) {
    return await Notification.create(notificationData);
  }

  async findAllByRecipientId(recipientId) {
    return await Notification.findAll({
      where: { recipient_id: recipientId },
      order: [['createdAt', 'DESC']],
    });
  }

  async findByIdForUser(notificationId, userId) {
    return await Notification.findOne({
      where: {
        notification_id: notificationId,
        recipient_id: userId,
      },
    });
  }

  async findById(notificationId) {
    return await Notification.findByPk(notificationId);
  }

  async markAsSeen(notification) {
    notification.seen = true;
    return await notification.save();
  }
}

module.exports = new NotificationRepository();