
module.exports = (sequelize, DataTypes) => {
    const Notification = sequelize.define('Notification', {
        notification_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
          },
      
          title: {
            type: DataTypes.STRING,
            allowNull: true
          },
      
          message: {
            type: DataTypes.TEXT,
            allowNull: false
          },
      
          // نوع الإشعار:
          // 'GENERAL'       -> إشعارات عامة
          // 'HEALTH_ALERT'  -> إنذارات صحية
          // 'APPOINTMENT'   -> مواعيد
          // 'REMINDER'      -> تذكير
          // 'SYSTEM'        -> إشعارات تقنية
          // 'OTHER'         -> أي شيء آخر
          type: {
            type: DataTypes.ENUM(
              'GENERAL',
              'HEALTH_ALERT',
              'APPOINTMENT',
              'REMINDER',
              'SYSTEM',
              'OTHER'
            ),
            allowNull: false
          },
      
          // السياق المرتبط بالإشعار:
          // 'DEVICE'      -> الجهاز
          // 'APPOINTMENT' -> موعد
          // 'TEST'        -> تحليل
          // 'NONE'        -> لا يوجد سياق مباشر
          context_type: {
            type: DataTypes.ENUM('DEVICE', 'APPOINTMENT', 'TEST', 'NONE'),
            allowNull: true
          },
      
          context_id: {
            type: DataTypes.STRING(36), // يدعم UUID أو INT
            allowNull: true
          },
      
          recipient_id: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
      
          sender_id: {
            type: DataTypes.INTEGER,
            allowNull: true
          },
      
          seen: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
          },
      
          scheduled_at: {
            type: DataTypes.DATE,
            allowNull: true
          },
      
          // أولوية الإشعار: منخفضة / متوسطة / عالية / حرجة
          priority: {
            type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'),
            defaultValue: 'MEDIUM'
          },
      
          // التطبيق المستهدف
          target_app: {
            type: DataTypes.ENUM('PATIENT_APP', 'DOCTOR_APP', 'BOTH'),
            defaultValue: 'BOTH'
          },
      
          // وسيلة الإرسال: داخل التطبيق، إيميل، SMS، إلخ
          delivery_method: {
            type: DataTypes.ENUM('IN_APP', 'EMAIL', 'SMS', 'PUSH'),
            defaultValue: 'IN_APP'
          },
      
          createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
          },
      
          updatedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
          }
        
    }, {
        timestamps: true
    });

    return Notification;
};

