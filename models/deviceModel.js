module.exports = (sequelize, DataTypes) => {
  const Device = sequelize.define("Device", {
    deviceId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    serialNumber: { // QR Code
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    model: {
      type: DataTypes.STRING,
    },
    isAssigned: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  });
  return Device;
};
