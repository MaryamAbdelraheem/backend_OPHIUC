// routes/vitals.js
const express = require("express");
const router = express.Router();
const vitalsController = require("../controllers/vitalsController");
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");
const { vitalsRateLimiter } = require("../middleware/rateLimiter");


/**
 * @route POST /api/vitals/average
 * @access protected (patient & doctor)
 */
router
  .route("/average")
  .post(
    authenticateToken,
    authorizeRoles("patient", "doctor"),
    vitalsRateLimiter,
    vitalsController.handleAverageVitals
  );

module.exports = router;