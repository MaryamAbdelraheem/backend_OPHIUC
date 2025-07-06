const express = require("express");
const router = express.Router();
const { getAllVitals } = require('../controllers/vitalsController');
router
    .route('/')
    .get(getAllVitals)



module.exports = router;