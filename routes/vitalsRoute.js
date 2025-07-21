const express = require("express");
const router = express.Router();
const {
  listenToFirebaseVitals,
  getLastAveragedVitals
} = require("../controllers/vitalsController");
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");
const { vitalsRateLimiter } = require("../middleware/rateLimiter");

/**
 * @swagger
 * tags:
 *   name: Vitals
 *   description: Realtime and averaged vital signs
 */

/**
 * @swagger
 * /vitals/average:
 *   post:
 *     summary: Receive realtime vitals from Firebase and calculate average
 *     tags: [Vitals]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully calculated average vitals
 *       429:
 *         description: Too many requests
 *       401:
 *         description: Unauthorized
 */
router
  .route("/average")
  .post(
    authenticateToken,
    authorizeRoles("patient", "doctor"),
    vitalsRateLimiter,
    listenToFirebaseVitals
  );

/**
 * @swagger
 * /vitals/last-averaged:
 *   get:
 *     summary: Get last averaged vitals for current user
 *     tags: [Vitals]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns last averaged vitals
 *       404:
 *         description: No averaged vitals found
 */
router
  .route("/last-averaged")
  .get(
    authenticateToken,
    authorizeRoles("patient", "doctor"),
    getLastAveragedVitals
  );

module.exports = router;


// const express = require("express");
// const router = express.Router();
// const { listenToFirebaseVitals, getLastAveragedVitals } = require("../controllers/vitalsController");
// const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");
// const { vitalsRateLimiter } = require("../middleware/rateLimiter");


// /**
//  * @route POST, GET /api/v1/vitals/average
//  * @access protected 
//  */
// router
//   .route("/average")
//   .post(
//     authenticateToken,
//     authorizeRoles("patient", "doctor"),
//     vitalsRateLimiter,
//     listenToFirebaseVitals
//   )

// router
//   .route('/last-averaged')
//   .get(
//     authenticateToken,
//     authorizeRoles('patient', 'doctor'),
//     getLastAveragedVitals
//   )

// module.exports = router;