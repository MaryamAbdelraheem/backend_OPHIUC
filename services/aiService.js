const axios = require("axios");
const AI_BASE_URL = process.env.AI_SERVER_URL;

// 1. Predict Sleep Apnea
async function predictSleepApnea(data) {
  const res = await axios.post(`${AI_BASE_URL}/predict`, data);
  return res.data;
}

// 2. Treatment Recommendation
async function getTreatmentPlan(data) {
  const res = await axios.post(`${AI_BASE_URL}/treatment`, data);
  return res.data;
}

// 3. Short Report
async function getReport(data) {
  const res = await axios.post(`${AI_BASE_URL}/report`, data);
  return res.data;
}

// 4. Full Report (Detailed)
async function getFullReport(data) {
  const res = await axios.post(`${AI_BASE_URL}/full_report`, data);
  return res.data;
}

module.exports = {
  predictSleepApnea,
  getTreatmentPlan,
  getReport,
  getFullReport,
};