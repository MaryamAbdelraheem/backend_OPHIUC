const express = require("express");
const router = express.Router();
const patientController = require("../controllers/patientController");
const { loginValidationRules } = require("../validators/authValidator");
const {validateRequest} = require("../middleware/validateRequest");
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");
const authPatientController = require('../controllers/authPatientController');

// Protected routes - require patient role

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