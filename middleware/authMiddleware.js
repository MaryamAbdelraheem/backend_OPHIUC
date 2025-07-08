const jwt = require("jsonwebtoken");
require("dotenv").config(); // Load env variables


const SECRET_KEY = process.env.SECRET_KEY || "ophiucs-project-secret-jwt"; // Use env variable

// Middleware to protect routes
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];


  if (!token) return res.status(401).json({ message: "Unauthorized: No token provided" });


  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Forbidden: Invalid token" });

    req.user = decoded; // Attach user info to request
    next();
  });
}


// Role-based access control middleware
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized: No user found" });
    }


    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Forbidden: Access denied. Required role: ${allowedRoles.join(", ")}`
      });
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