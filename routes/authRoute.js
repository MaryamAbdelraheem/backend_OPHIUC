
const express = require('express');
const router = express.Router();
const { loginValidationRules } = require('../validators/authValidator')
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");
const { signupPatient, loginAdmin } = require('../controllers/authController');
// router
//     .route('/signupPatient')
//     .post(signupPatient);

router
    .route('/loginAdmin')
    .post(
        loginValidationRules(),
        loginAdmin
    );
module.exports = router;