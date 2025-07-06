const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
    const Admin = sequelize.define('Admin', {
        adminId: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [8, 100]
            }
        }
    }, {
        timestamps: true,
        paranoid: true,
        tableName: 'admin'
    });



    // تشفير كلمة المرور قبل الحفظ (داخل نطاق الدالة)
    Admin.beforeCreate(async (admin) => {
        if (admin.password) {
            const salt = await bcrypt.genSalt(10);
            admin.password = await bcrypt.hash(admin.password, salt);
        }
    });

    return Admin; // تصدير النموذج مرة واحدة فقط
};