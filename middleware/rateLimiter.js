const rateLimit = require("express-rate-limit");

exports.vitalsRateLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // كل 30 دقيقة
  max: 5, // max 5 requests
  message: "Too many vitals submissions. Please wait.",
});