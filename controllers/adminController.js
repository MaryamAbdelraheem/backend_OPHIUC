const ApiError = require('../utils/errors/ApiError');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const { Doctor } = require('../models'); // استيراد موديل الطبيب (في حالة استخدام قاعدة بيانات)

/*exports.loginAdmin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email && !password) {
        return next(new ApiError("Please provide email and password"), 400)
     }

    if (email !== STATIC_ADMIN.email || password !== STATIC_ADMIN.password) {
        return next(new ApiError("Invalid credentials"), 401)
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
        status: 'success',
        message: "Login successful",
        data: {
                id: STATIC_ADMIN.id,
                email: STATIC_ADMIN.email,
                role: STATIC_ADMIN.role,
        },
        token,
    });
});
*/
/**
 * @method GET
 * @route /api/admin/users/doctors
 * @desc View doctors for admin
 * @access private
 */
exports.viewDoctors = asyncHandler(async (req, res, next) => {
    const doctors = await Doctor.findAll({
        attributes: { exclude: ['password'] }
    });

    if (!doctors) {
        return next(new ApiError('No doctors found', 404));
    }

    res.status(200).json({
        status: 'success',
        message: 'Doctors fetched successfully',
        data: {
            doctors
        }
    });
});

/**
 * @method POST
 * @route /api/v1/admin/users/doctors
 * @desc Add doctor
 * @access Private (Admin)
 */
exports.addDoctor = asyncHandler(async (req, res, next) => {
    const { firstName, lastName, email, password, phoneNumber, specialization, gender } = req.body;

    // 1. التأكد من عدم وجود طبيب بنفس الإيميل
    const existingDoctor = await Doctor.findOne({ where: { email } });
    if (existingDoctor) {
        return next(new ApiError('Doctor with this email already exists', 400));
    }

    // 2. تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password.trim(), 10);

    // 3. إنشاء حساب الطبيب
    const newDoctor = await Doctor.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        phoneNumber,
        specialization,
        gender
    });

    // 4. تجهيز البيانات بدون الباسورد
    const { password: _, ...doctorData } = newDoctor.toJSON();

    // 5. إرسال الرد
    res.status(201).json({
        status: 'success',
        message: "Doctor created successfully",
        data: {
            doctor: doctorData,
        }
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
        return next(new ApiError("Doctor not found", 404));
    }

    // 2. حذف الطبيب
    await doctor.destroy();

    // 3. إرسال الرد
    res.status(200).json({
        status: "success",
        message: "Doctor deleted successfully",
    });
});
