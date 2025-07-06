const { Vitals } = require("../models");
const asyncHandler = require('express-async-handler');


// GET /api/vitals
exports.getAllVitals = asyncHandler(async (req, res) => {

    const vitalsList = await Vitals.findAll();
    res.status(200).json({
        status: 'success',
        data: {
            vitals: vitalsList
        }
    });
});