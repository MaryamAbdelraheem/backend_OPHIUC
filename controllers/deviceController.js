const ApiError = require('../utils/errors/ApiError');
const asyncHandler = require('express-async-handler');
const { Device } = require('../models');

/**
 * @route POST /api/v1/devices/bind
 * @desc Bind scanned device (via QR code) to the logged-in patient
 */
exports.bindDeviceToPatient = asyncHandler(async (req, res, next) => {
    const { serialNumber, model } = req.body;
    const patientId = req.user.id;

    if (!serialNumber) {
        return next(new ApiError("serialNumber is required", 400));
    }

    // Try to find existing device
    let device = await Device.findOne({ where: { serialNumber } });

    // If not found, create it
    if (!device) {
        if (!model) {
            return next(new ApiError("Device not found. Please include device model to register it.", 400));
        }

        device = await Device.create({
            serialNumber,
            model,
            isAssigned: true,
            patientId,
        });

        return res.status(201).json({
            status: "success",
            message: "Device registered and assigned to patient successfully",
            data: {
                device
            },
        });
    }

    // If already assigned
    if (device.isAssigned) {
        return next(new ApiError("Device is already assigned", 400));
    }

    // Assign to current patient
    device.patientId = patientId;
    device.isAssigned = true;
    await device.save();

    res.status(200).json({
        status: "success",
        message: "Device assigned to patient successfully",
        data: { device },
    });
});
