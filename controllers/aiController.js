const aiService = require("../services/aiService");
const asyncHandler = require("express-async-handler");
///response if null

const handlePrediction = asyncHandler(async (req, res) => {
  const result = await aiService.predictSleepApnea(req.body);
  res.json(result);
  //if ('sever') == 5 -> push pop alert
});

const handleTreatment = asyncHandler(async (req, res) => {
  const result = await aiService.getTreatmentPlan(req.body);
  res.json(result);
});

const handleReport = asyncHandler(async (req, res) => {
  const result = await aiService.getReport(req.body);
  res.json(result);
});


const handleFullReport = asyncHandler(async (req, res) => {
  const result = await aiService.getFullReport(req.body);
  res.json(result);
});

module.exports = {
  handlePrediction,
  handleTreatment,
  handleReport,
  handleFullReport,
};