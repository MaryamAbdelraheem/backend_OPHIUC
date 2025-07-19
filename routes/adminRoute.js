const express = require('express');
const router = express.Router();
const { viewDoctors, addDoctor, deleteDoctor } = require('../controllers/adminController');
const { addDoctorValidator, deleteDoctorValidator } = require('../validators/adminValidator');
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");


/**
 * @route GET /api/v1/admin/dashboard
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
 * @route GET, POST /api/v1/admin/users/doctors
 * @access protected
 */
router
    .route('/users/doctors')
    .get(
        authenticateToken,
        authorizeRoles('admin'),
        viewDoctors
    )
    .post(
        authenticateToken,
        authorizeRoles('admin'),
        addDoctorValidator,
        addDoctor
    )

/**
 * @route DELETE /api/v1/admin/users/doctors/:id
 * @access protected
 */
router
    .route('/users/doctors/:id')
    .delete(
        authenticateToken,
        authorizeRoles('admin'),
        deleteDoctorValidator,
        deleteDoctor
    )


module.exports = router;