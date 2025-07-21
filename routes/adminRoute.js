const express = require('express');
const router = express.Router();
const { viewDoctors, addDoctor, deleteDoctor } = require('../controllers/adminController');
const { addDoctorValidator, deleteDoctorValidator } = require('../validators/adminValidator');
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin management routes
 */

/**
 * @swagger
 * /admin/dashboard:
 *   get:
 *     summary: Get admin dashboard
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Welcome message with user info
 *       401:
 *         description: Unauthorized
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
 * @swagger
 * /admin/users/doctors:
 *   get:
 *     summary: Get list of all doctors
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of doctors
 *       401:
 *         description: Unauthorized
 *   post:
 *     summary: Add a new doctor
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *               - specialty
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               specialty:
 *                 type: string
 *     responses:
 *       201:
 *         description: Doctor created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
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
 * @swagger
 * /admin/users/doctors/{id}:
 *   delete:
 *     summary: Delete a doctor by ID
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Doctor ID
 *     responses:
 *       200:
 *         description: Doctor deleted successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Doctor not found
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


// const express = require('express');
// const router = express.Router();
// const { viewDoctors, addDoctor, deleteDoctor } = require('../controllers/adminController');
// const { addDoctorValidator, deleteDoctorValidator } = require('../validators/adminValidator');
// const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");


// /**
//  * @route GET /api/v1/admin/dashboard
//  * @access protected
//  */
// router
//     .route("/dashboard")
//     .get(
//         authenticateToken,
//         authorizeRoles('admin'),
//         (req, res) => {
//             res.json({ message: "Welcome to the dashboard", user: req.user });
//         }
//     )

// /**
//  * @route GET, POST /api/v1/admin/users/doctors
//  * @access protected
//  */
// router
//     .route('/users/doctors')
//     .get(
//         authenticateToken,
//         authorizeRoles('admin'),
//         viewDoctors
//     )
//     .post(
//         authenticateToken,
//         authorizeRoles('admin'),
//         addDoctorValidator,
//         addDoctor
//     )

// /**
//  * @route DELETE /api/v1/admin/users/doctors/:id
//  * @access protected
//  */
// router
//     .route('/users/doctors/:id')
//     .delete(
//         authenticateToken,
//         authorizeRoles('admin'),
//         deleteDoctorValidator,
//         deleteDoctor
//     )


// module.exports = router;