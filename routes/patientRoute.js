const express = require("express");
const router = express.Router();
const patientController = require("../controllers/patientController");
const { } = require("../validators/authValidator");
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");

//
/**
 * @route /api/patient/:id
 * @access Protected 
 */
router
    .route('/:id')
    .get(
        authenticateToken,
        authorizeRoles('patient'),
        patientController.getProfile
    )
    .put(
        authenticateToken,
        authorizeRoles('patient'),
        patientController.updateProfile
    )
  

module.exports = router;