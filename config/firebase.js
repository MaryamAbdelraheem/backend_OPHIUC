// config/firebase.js
const admin = require("firebase-admin");

// مسار ملف الخدمة
const serviceAccount = require("./osahealthmonitor-firebase-adminsdk-fbsvc-f42e920593.json");

// تأكد من عدم تكرار التهيئة
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://osahealthmonitor-default-rtdb.firebaseio.com",
    });
}

// تصدير قاعدة البيانات مباشرة
module.exports = admin.database();
