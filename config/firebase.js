// config/firebase.js
const admin = require("firebase-admin");

let db;

if (!admin.apps.length) {
    const serviceAccount = require('./osahealthmonitor-firebase-adminsdk-fbsvc-f42e920593.json');

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://osahealthmonitor-default-rtdb.firebaseio.com", // ← خليك على رابط واحد
    });

    db = admin.database();
} else {
    db = admin.app().database();
}

module.exports = db;
