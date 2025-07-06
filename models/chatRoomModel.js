// const { DataTypes, Model } = require('sequelize');
// const sequelize = require('../util/database')

// const ChatRoom = sequelize.define('ChatRoom', {
//     chatRoom_id: {
//         type: DataTypes.INTEGER,
//         primaryKey: true,
//         autoIncrement: true
//     },
//     roomName: DataTypes.STRING,
//     createdAt: DataTypes.DATE
// }, {
//     timestamps: false
// });

// // العلاقات
// ChatRoom.belongsToMany(Doctor, { through: 'Doctor_chatRoom' });
// ChatRoom.belongsToMany(Patient, { through: 'Patient_chatRoom' });

// module.exports = ChatRoom;