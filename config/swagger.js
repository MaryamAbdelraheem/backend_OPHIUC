const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

// تحميل ملف التوثيق الرئيسي اللي بيحتوي على $ref للملفات الفرعية
const swaggerDocument = YAML.load(path.join(__dirname, '../docs/swagger.yaml'));

module.exports = (app) => {
  // ربط التوثيق بالمسار /api-docs
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};