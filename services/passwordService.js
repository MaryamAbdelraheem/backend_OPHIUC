const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const redisClient = require("../config/redisClient");
const ApiError = require("../utils/errors/ApiError");

const patientRepository = require("../repositories/patientRepository");
const doctorRepository = require("../repositories/doctorRepository");


class PasswordService {
  // logout(token) 
  async logout(token) {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) {
      throw new ApiError("Invalid token structure", 400);
    }

    const expiryInSeconds = decoded.exp - Math.floor(Date.now() / 1000);
    await redisClient.set(`blacklist:${token}`, "true", "EX", expiryInSeconds);
  }

  // forgotPassword(email) -> patient & doctor repositry
  async forgotPassword(email) {
    const user = await patientRepository.findByEmail(email) || await doctorRepository.findByEmail(email);
    if (!user) throw new ApiError("User not found", 404);

    const token = crypto.randomBytes(32).toString("hex");
    const expiresInMinutes = 15;

    await redisClient.set(`reset:${token}`, email, "EX", expiresInMinutes * 60);

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Reset your password",
      html: `<p>You requested a password reset.</p><p><a href="${resetLink}">Click here to reset</a></p>`
    });
  }

  // resetPassword(token, newPassword) -> patient & doctor repositry
  async resetPassword(token, newPassword) {
    const email = await redisClient.get(`reset:${token}`);
    if (!email) throw new ApiError("Invalid or expired token", 400);

    const user = await patientRepository.findByEmail(email) || await doctorRepository.findByEmail(email);
    if (!user) throw new ApiError("User not found", 404);

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    await redisClient.del(`reset:${token}`);
  }


  // changePassword(user, oldPassword, newPassword) -> patient & doctor repositry
  async changePassword(user, oldPassword, newPassword) {
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) throw new ApiError("Old password is incorrect", 400);

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
  }
}

module.exports = new PasswordService();