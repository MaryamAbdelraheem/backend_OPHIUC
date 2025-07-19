const express = require("express");
const router = express.Router();
const { handleAverageVitals } = require("../controllers/vitalsController");
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");
const { vitalsRateLimiter } = require("../middleware/rateLimiter");


/**
 * @route POST /api/v1/vitals/average
 * @access protected 
 */
router
  .route("/average")
  .post(
    authenticateToken,
    authorizeRoles("patient", "doctor"),
    vitalsRateLimiter,
    handleAverageVitals
  );

module.exports = router;