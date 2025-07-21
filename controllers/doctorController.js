const ApiError = require('../utils/errors/ApiError');
const { Doctor, Patient } = require('../models');
const asyncHandler = require('express-async-handler');
const doctorService = require('../services/doctorService');
/**
 * @method GET
 * @route /api/v1/doctors/:id
 * @desc View doctor profile
 * @access public 
 */
exports.getProfile = asyncHandler(async (req, res, next) => {
  const { id: doctorId } = req.params;

  const doctor = await doctorService.getDoctorProfile(doctorId);
  if (!doctor) {
    return next(new ApiError("Doctor not found", 404));
  }

  res.status(200).json({
    status: 'success',
    message: "Doctor profile fetched successfully",
    data: { doctor }
  });
});


/**
 * @method GET
 * @route /api/v1/doctors/:id/patients
 * @desc View doctor patients
 * @access private 
 */
exports.getPatients = asyncHandler(async (req, res, next) => {
  const { id: doctorId } = req.params;

  const result = await doctorService.getDoctorPatients(doctorId);

  res.status(result.statusCode).json(result.response);
});


/**
 * @method GET
 * @route /api/v1/doctors/:doctorId/patients/:patientId
 * @desc View patient profile for doctor
 * @access private
*/

exports.getPatientProfile = asyncHandler(async (req, res, next) => {
  const { doctorId, patientId } = req.params;

  const result = await doctorService.getPatientProfileForDoctor(doctorId, patientId);

  res.status(result.statusCode).json(result.response);
});