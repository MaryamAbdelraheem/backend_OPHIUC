
const express = require('express');
const router = express.Router();
const { signupPatientValidationRules , loginValidationRules } = require('../validators/authValidator')
const { signupPatient, login } = require('../controllers/authController');


//signup patient>>>>>>>>>>>>>>
router
    .route('/signupPatient')
    .post(
        signupPatientValidationRules(),
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
