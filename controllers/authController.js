const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const asyncHandler = require('express-async-handler');
const { generateToken } = require("../middleware/authMiddleware");
const NotificationService = require('../services/NotificationService');
const { Doctor, Patient } = require('../models');

const SECRET_KEY = process.env.JWT_SECRET || "ophiucs-project-secret-jwt";

// بيانات الأدمن من .env
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

const STATIC_ADMIN = {
    id: 1,
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    role: "admin",
};

exports.loginAdmin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email && !password) {
        return res.status(400).json({ message: "Please provide email and password" });
    }

    if (email !== STATIC_ADMIN.email || password !== STATIC_ADMIN.password) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
        {
            id: STATIC_ADMIN.id,
            email: STATIC_ADMIN.email,
            role: STATIC_ADMIN.role,
        },
        SECRET_KEY,
        { expiresIn: "1d" }
    );

    res.status(200).json({
        message: "Login successful",
        admin: {
            id: STATIC_ADMIN.id,
            email: STATIC_ADMIN.email,
            role: STATIC_ADMIN.role,
        },
        token,
    });
});