const ApiError = require('../utils/errors/ApiError');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const { Doctor } = require('../models');
const doctorService = require('../services/doctorService');

/**
 * @method GET
 * @route /api/admin/users/doctors
 * @desc View doctors for admin
 * @access private
 */
exports.viewDoctors = asyncHandler(async (req, res) => {
    const doctors = await doctorService.getAllDoctors();

    res.status(200).json({
        status: 'success',
        message: 'Doctors fetched successfully',
        data: { doctors }
    });
});


/**
 * @method POST
 * @route /api/v1/admin/users/doctors
 * @desc Add doctor
 * @access Private (Admin)
 */
exports.addDoctor = asyncHandler(async (req, res) => {
    const doctor = await doctorService.addDoctor(req.body);

    res.status(201).json({
        status: 'success',
        message: 'Doctor created successfully',
        data: { doctor }
    });
});

/**
 * @method DELETE
 * @route /api/admin/users/doctors/:id
 * @desc Delete doctor //soft delete, عشان اقدر ارجعه بسهولة لو احتجته
 * @access private
 */
exports.deleteDoctor = asyncHandler(async (req, res) => {
    await doctorService.deleteDoctor(req.params.id);

    res.status(200).json({
        status: 'success',
        message: 'Doctor deleted successfully'
    });
});
