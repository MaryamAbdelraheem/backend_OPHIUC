module.exports = (sequelize, DataTypes) => {
  const Device = sequelize.define('Device', {
    deviceId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    activation: {
      type: DataTypes.BOOLEAN
    }
  }, {
    timestamps: true,
    paranoid: true,
    tableName: 'devices'
  });


  return Device;
};




// 
/*
Device.prototype.sendAlertNotification = async function (message, recipientId) {
  const NotificationService = require('../services/NotificationService');

  return await NotificationService.send({
    type: 'HEALTH_ALERT',
    message,
    recipient_id: recipientId,
    context: {
      context_type: 'DEVICE',
      context_id: this.id
    }
  });
};
 */