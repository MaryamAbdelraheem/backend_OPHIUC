const express = require("express");
const router = express.Router();
const {
  listenToFirebaseVitals,
  getLastAveragedVitals
} = require("../controllers/vitalsController");
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");
const { vitalsRateLimiter } = require("../middleware/rateLimiter");


router
  .route("/average")
  .post(
    authenticateToken,
    authorizeRoles("patient", "doctor"),
    vitalsRateLimiter,
    listenToFirebaseVitals
  );


router
  .route("/last-averaged")
  .get(
    authenticateToken,
    authorizeRoles("patient", "doctor"),
    getLastAveragedVitals
  );

module.exports = router;


