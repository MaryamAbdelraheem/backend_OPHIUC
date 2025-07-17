const ApiError = require('../utils/errors/ApiError');
const jwt = require("jsonwebtoken");
require("dotenv").config(); // Load env variables
const redisClient = require("../config/redisClient");

const SECRET_KEY = process.env.SECRET_KEY || "ophiucs-project-secret-jwt"; // Use env variable

// Middleware to protect routes
async function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return next(new ApiError("Unauthorized: No token provided", 401));
  }

  // Check if token is blacklisted in Redis
  try {
    const isBlacklisted = await redisClient.get(`blacklist:${token}`);
    if (isBlacklisted) {
      return next(new ApiError("Token has been revoked", 401));
    }
  } catch (err) {
    console.error("Redis error:", err);
    return next(new ApiError("Internal server error", 500));
  }

  // Verify token
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return next(new ApiError("Forbidden: Invalid token", 403));
    }

    req.user = decoded; // Attach user info to request
    next();
  });
}


// Role-based access control middleware
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError("Unauthorized: No user found", 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new ApiError(`Forbidden: Access denied. Required role: ${allowedRoles.join(", ")}`, 403));
    }

    next();
    console.log("Role in authorizeRoles:", req.user.role);
  };
}

// Generate JWT token with role
function generateToken(user, role) {
  const payload = {
    id: user.id || user.doctorId || user.patientId,
    email: user.email,
    role: role
  };

  return jwt.sign(payload, SECRET_KEY, { expiresIn: "12h" });
}



module.exports = { authenticateToken, generateToken, authorizeRoles };