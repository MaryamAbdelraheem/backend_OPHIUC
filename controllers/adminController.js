const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const { generateToken } = require("../middleware/authMiddleware");
const { Doctor } = require('../models'); // استيراد موديل الطبيب (في حالة استخدام قاعدة بيانات)


const SECRET_KEY = process.env.JWT_SECRET || 'ophiucs-project-secret-jwt';
/*
admin@pannel$12324
admin@example.com
*/
// إنشاء كلمة مرور مشفرة مسبقًا
const plainPassword = 'admin@pannel$12324';
const hashedPassword = bcrypt.hashSync(plainPassword, 10);
// console.log(hashedPassword);
// بيانات المسؤول (يجب استبدالها بقاعدة بيانات في المستقبل)
const adminUser = [
    { id: 1, email: 'admin@example.com', password: hashedPassword }
];

/**
 * @method POST
 * @route /api/admin/login
 * @desc login a admin
 * @access public 
 */
exports.login = asyncHandler(async (req, res, next) => {

    const { email, password } = req.body;

    const admin = adminUser.find(user => user.email === email);
    if (!admin) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password after removing whitespace
    const isMatch = await bcrypt.compare(password.trim(), admin.password);

    if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create JWT token
    const token = generateToken(admin, "admin");

    // Hide password when sending data
    const adminData = { ...admin };
    delete adminData.password;

    // Send response to client
    res.status(200).json({
        message: 'Login successful',
        admin: adminData,
        token,
    });
});

/**
 * @method GET
 * @route /api/admin/users/doctors
 * @desc View doctors for admin
 * @access private
 */
exports.viewDoctors = asyncHandler(async (req, res, next) => {
    // 1. جلب قائمة الأطباء من قاعدة البيانات
    const doctors = await Doctor.findAll({
        attributes: { exclude: ['password'] }
    });

    if (!doctors) {
        return res.status(404).json({ message: 'No doctors found' });
    }

    // 2. إرسال البيانات للأطباء
    res.status(200).json({
        message: 'Doctors fetched successfully',
        doctors,  // قائمة الأطباء
    });
});

/**
 * @method POST
 * @route /api/admin/users/doctors
 * @desc Add doctor
 * @access private
 */
exports.addDoctor = asyncHandler(async (req, res, next) => {
    const { firstName, lastName, email, password, phoneNumber, specialization, gender } = req.body;

    // 1. تحقق من وجود كل البيانات المطلوبة
    if (!firstName || !lastName || !email || !password || !phoneNumber || !specialization || !gender) {
        return res.status(400).json({ message: "Please provide all required fields" });
    }

    // 2. التحقق إذا كان الطبيب موجود بالفعل بنفس الإيميل
    const existingDoctor = await Doctor.findOne({ where: { email } });

    if (existingDoctor) {
        return res.status(400).json({ message: "Doctor with this email already exists" });
    }

    // 3. تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password.trim(), 10);

    // 4. إنشاء حساب الطبيب
    const newDoctor = await Doctor.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        phoneNumber,
        specialization,
        gender
    });

    // 5. إخفاء كلمة المرور قبل إرسال الرد
    const doctorData = { ...newDoctor.toJSON() };
    delete doctorData.password;

    // 6. إرسال الرد
    res.status(201).json({
        message: "Doctor created successfully",
        doctor: doctorData,
    });
});


/**
 * @method DELETE
 * @route /api/admin/users/doctors/:id
 * @desc Delete doctor //soft delete, عشان اقدر ارجعه بسهولة لو احتجته
 * @access private
 */
exports.deleteDoctor = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    // 1. التأكد من وجود الطبيب
    const doctor = await Doctor.findByPk(id);

    if (!doctor) {
        return res.status(404).json({ message: "Doctor not found" });
    }

    // 2. حذف الطبيب
    await doctor.destroy();

    // 3. إرسال الرد
    res.status(200).json({
        message: "Doctor deleted successfully",
    });
});
