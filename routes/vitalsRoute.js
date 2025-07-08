const express = require("express");
const router = express.Router();
const { getAllVitals } = require('../controllers/vitalsController');


/**
 * @route /api/vitals
 * @access protected
 */
router
    .route('/')
    .get(getAllVitals)



module.exports = router;