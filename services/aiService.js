const axios = require("axios");
const AI_BASE_URL = process.env.AI_SERVER_URL;

// 1. Predict Sleep Apnea
async function predictSleepApnea(data, token) {
  const res = await axios.post(`${AI_BASE_URL}/predict`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}

// 2. Treatment Recommendation
async function getTreatmentPlan(data, token) {
  const res = await axios.post(`${AI_BASE_URL}/treatment`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}

// 3. Short Report
async function getReport(data, token) {
  const res = await axios.post(`${AI_BASE_URL}/report`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}

// 4. Full Report (Detailed)
async function getFullReport(data, token) {
  const res = await axios.post(`${AI_BASE_URL}/full_report`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}

module.exports = {
  predictSleepApnea,
  getTreatmentPlan,
  getReport,
  getFullReport,
};
