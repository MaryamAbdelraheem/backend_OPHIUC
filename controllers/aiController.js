const databaseFire = require('../config/firebase'); // استدعاء Firebase Realtime DB
const ApiError = require('../utils/errors/ApiError');
const aiService = require("../services/aiService");
const asyncHandler = require("express-async-handler");

exports.handlePrediction = asyncHandler(async (req, res, next) => {
  const result = await aiService.predictSleepApnea(req.body);

  if (!result) {
    return next(new ApiError("Prediction failed or no result returned", 400));
  }

  // تحقق من تهيئة Firebase
  if (!databaseFire) {
    return next(new ApiError("Firebase database not initialized", 500));
  }

  // تحقق من الحالة الشديدة
  if (result.severity === 5) {
    const alertRef = databaseFire.ref('alerts').push(); // push لتنبيه جديد
    await alertRef.set({
      timestamp: new Date().toISOString(),
      message: "Severe sleep apnea case detected",
      patientId: req.body.patientId || null,
      severity: result.severity,
      prediction: result
    });

    console.log("Alert pushed to Firebase successfully");
  }

  res.status(200).json({
    status: "success",
    data: result
  });
});

exports.handleTreatment = asyncHandler(async (req, res, next) => {
  const result = await aiService.getTreatmentPlan(req.body);

  if (!result) {
    return next(new ApiError('No treatment plan found', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Treatment plan retrieved successfully',
    data: result
  });
});

exports.handleReport = asyncHandler(async (req, res, next) => {
  const result = await aiService.getReport(req.body);

  if (!result) {
    return next(new ApiError('No report found', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Report generated successfully',
    data: result
  });
});

exports.handleFullReport = asyncHandler(async (req, res, next) => {
  const result = await aiService.getFullReport(req.body);

  if (!result) {
    return next(new ApiError('No full report found', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Full report generated successfully',
    data: result
  });
});
