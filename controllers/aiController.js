const databaseFire = require('../config/firebase'); // استدعاء Firebase Realtime DB
const redisClient = require("../config/redisClient");
const ApiError = require('../utils/errors/ApiError');
const aiService = require("../services/aiService");
const asyncHandler = require("express-async-handler");

exports.handlePrediction = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  const result = await aiService.predictSleepApnea(req.body, token);

  if (!result) {
    return next(new ApiError("Prediction failed or no result returned", 400));
  }

  if (!databaseFire) {
    return next(new ApiError("Firebase database not initialized", 500));
  }

  const patientId = req.user.id || "unknown";
  const redisKey = `severe_count:${patientId}`;

  if (result.prediction === "Severe") {
    // زود العداد في Redis
    const currentCount = await redisClient.incr(redisKey);

    // خلي العداد ينتهي بعد 15 دقيقة (optional)
    if (currentCount === 1) {
      await redisClient.expire(redisKey, 900); // 15 دقيقة = 900 ثانية
    }

    // لما نوصل لـ 5 مرات متتالية
    if (currentCount >= 5) {
      const alertRef = databaseFire.ref('alerts').push();
      await alertRef.set({
        timestamp: new Date().toISOString(),
        message: "Severe sleep apnea detected 5 times in a row",
        patientId: patientId,
        severity: 5,
        prediction: result.prediction
      });

      console.log("Alert pushed to Firebase after 5 severe detections");

      // تصفير العداد بعد إرسال التنبيه
      await redisClient.del(redisKey);
    } else {
      console.log(`Severe detected ${currentCount}/5 for patient ${patientId}`);
    }
  } else {
    // لو الحالة مش شديدة، نصفر العداد
    await redisClient.del(redisKey);
  }

  res.status(200).json({
    status: "success",
    data: {
      result
    }
  });
});

exports.handleTreatment = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  const result = await aiService.getTreatmentPlan(req.body, token);

  if (!result) {
    return next(new ApiError('No treatment plan found', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Treatment plan retrieved successfully',
    data: {
      result
    }
  });
});

exports.handleReport = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  const result = await aiService.getReport(req.body, token);

  if (!result) {
    return next(new ApiError('No report found', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Report generated successfully',
    data: {
      result
    }
  });
});

exports.handleFullReport = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  const result = await aiService.getFullReport(req.body, token);

  if (!result) {
    return next(new ApiError('No full report found', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Full report generated successfully',
    data: {
      result
    }
  });
});
