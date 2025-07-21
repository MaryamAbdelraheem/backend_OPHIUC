const ApiError = require('../utils/errors/ApiError');
const bcrypt = require("bcryptjs");
const { Patient } = require("../models");
const asyncHandler = require('express-async-handler');
const patientService = require('../services/patientService');


/**
 * @method PUT
 * @route /api/v1/patients/:id
 * @desc Update patient profile
 * @access public 
 */

exports.updateProfile = asyncHandler(async (req, res) => {
  const updatedPatient = await patientService.updateProfile(
    req.user.id,
    req.params.id,
    req.body
  );

  res.status(200).json({
    status: 'success',
    message: 'Profile updated successfully',
    data: {
      patient: updatedPatient
    }
  });
});


/**
 * @method GET
 * @route /api/v1/patients/:id
 * @desc View patient profile
 * @access public 
 */
exports.getProfile = asyncHandler(async (req, res) => {
  const patient = await patientService.getProfile(req.params.id);

  res.status(200).json({
    status: 'success',
    message: 'Patient profile fetched successfully',
    data: {
      patient
    }
  });
});

