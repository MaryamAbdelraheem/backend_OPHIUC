module.exports = (sequelize, DataTypes) => {
    const Vitals = sequelize.define('Vitals', {
        VitalsId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        Age: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        Gender: {
            type: DataTypes.ENUM('Male', 'Female'),
            allowNull: false
        },
        BMI: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        Snoring: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        Oxygen_Saturation: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        AHI: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        ECG_Heart_Rate: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        Nasal_Airflow: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        Chest_Movement: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        EEG_Sleep_Stage: {
            type: DataTypes.STRING,
            allowNull: false
        },
        Diagnosis: {
            type: DataTypes.STRING,
            allowNull: true
        },
        // ✅ المفاتيح الخارجية
        patientId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        doctorId: {
            type: DataTypes.INTEGER,
            allowNull: true, // يمكن يكون null لو لسه لم يُراجع من طبيب
        },
        deviceId: {
            type: DataTypes.INTEGER,
            allowNull: true, // يمكن يكون null لو مفيش جهاز محدد
        }
    }, {
        timestamps: true,
        paranoid: true,
        tableName: 'vitals'
    });

    return Vitals;
};
