const express = require('express');
const router = express.Router();
const { viewDoctors, addDoctor, deleteDoctor } = require('../controllers/adminController');
const { addDoctorValidator, deleteDoctorValidator } = require('../validators/adminValidator');
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");

router
    .route("/dashboard")
    .get(
        authenticateToken,
        authorizeRoles('admin'),
        (req, res) => {
            res.json({ message: "Welcome to the dashboard", user: req.user });
        }
    )
 
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


router
    .route('/users/doctors/:id')
    .delete(
        authenticateToken,
        authorizeRoles('admin'),
        deleteDoctorValidator,
        deleteDoctor
    )

module.exports = router;

