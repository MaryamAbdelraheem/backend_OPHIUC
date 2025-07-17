
const express = require('express');
const router = express.Router();
const { signupPatientValidationRules , loginValidationRules } = require('../validators/authValidator')
const { signupPatient, login } = require('../controllers/authController');


/**
 * @route POST /api/v1/auth/signup
 */
router
    .route('/signup')
    .post(
        signupPatientValidationRules,
        signupPatient
    )

//login>>>>>>>>>>>>>>>>>>>>>>
/*router
    .route('/login')
    .post(
        loginValidationRules(),
        login
    )
*/

//logout>>>>>>>>>>>>>>>>>>>>
/*router
    .route('/logout')
    .post(

    )
*/
module.exports = router;
