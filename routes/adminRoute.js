const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { loginValidationRules } = require('../validators/authValidator');
const { validateRequest } = require('../middleware/validateRequest');//POST /api/admin / login
const { authenticateToken, generateToken, authorizeRoles } = require("../middleware/authMiddleware");


/**
 * @route /api/admin/dashboard
 * @access protected
 */
router
    .route("/dashboard")
    .get(
        authenticateToken,
        authorizeRoles('admin'),
        (req, res) => {
            res.json({ message: "Welcome to the dashboard", user: req.user });
        }
    )

/**
 * @route /api/admin/users/doctors
 * @access protected
 */
router
    .route('/users/doctors')
    .get(
        authenticateToken,
        authorizeRoles('admin'),
        adminController.viewDoctors
    )
    .post(
        authenticateToken,
        authorizeRoles('admin'),
        adminController.addDoctor
    )

/**
 * @route /api/admin/users/doctors/:id
 * @access protected
 */
router
    .route('/users/doctors/:id')
    .delete(
        authenticateToken,
        authorizeRoles('admin'),
        adminController.deleteDoctor
    )


module.exports = router;