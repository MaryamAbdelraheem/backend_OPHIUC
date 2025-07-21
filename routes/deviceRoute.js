const express = require('express');
const router = express.Router();
const { bindDeviceToPatient } = require('../controllers/deviceController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');


router
    .route('/bind')
    .post(
        authenticateToken,
        authorizeRoles('patient'),
        bindDeviceToPatient
    );

module.exports = router;

