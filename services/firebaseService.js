const admin = require("firebase-admin");
const serviceAccount = require("../config/osahealthmonitor-firebase-adminsdk-fbsvc-f42e920593.json")
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://osahealthmonitor-default-rtdb.firebaseio.com"
  });


const db = admin.database();

module.exports = db;