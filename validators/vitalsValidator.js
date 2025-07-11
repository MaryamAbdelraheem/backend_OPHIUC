const { body } = require("express-validator");

exports.validateAverageVitals = [
  body("device_id").notEmpty().withMessage("device_id is required"),
  body("Oxygen_Saturation").isNumeric(),
  body("AHI").isNumeric(),
  body("ECG_Heart_Rate").isNumeric(),
  body("Nasal_Airflow").isNumeric(),
  body("Chest_Movement").isNumeric(),
  body("EEG_Sleep_Stage").isString(),
];