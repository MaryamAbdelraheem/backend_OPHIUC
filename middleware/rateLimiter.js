const rateLimit = require("express-rate-limit");

exports.vitalsRateLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // كل 30 دقيقة
  max: 5, // max 5 requests
  message: "Too many vitals submissions. Please wait.",
});

// Forgot Password Rate Limiter
exports.forgotPasswordLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 دقائق
  max: 3, // أقصى عدد محاولات في الـ window
  message: {
    status: "fail",
    message: "Too many password reset requests, please try again later.",
  },
});
