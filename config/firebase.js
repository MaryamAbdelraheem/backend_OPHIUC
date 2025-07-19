const admin = require("firebase-admin");

const serviceAccount = require("./osahealthmonitor-firebase-adminsdk-fbsvc-f42e920593.json");

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://osahealthmonitor-default-rtdb.firebaseio.com",
    });
}

module.exports = admin.database();
