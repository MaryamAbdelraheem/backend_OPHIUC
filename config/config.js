require('dotenv').config();

const config = {
    development: {
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        dialect: process.env.DB_DIALECT,
        port: process.env.DB_PORT
    },
    test: {
        // إعدادات البيئة الاختبارية
    },
    production: {
        // إعدادات البيئة الإنتاجية
    }
};

module.exports = config;