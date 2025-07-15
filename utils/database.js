const { Sequelize } = require('sequelize'); 
const config = require('../config/config')
const sequelize = new Sequelize(config.development.database, config.development.username, config.development.password, config.development)

module.exports = sequelize;