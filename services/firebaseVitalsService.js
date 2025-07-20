const { Vitals, Device } = require('../models');
const db = require("../config/firebase");
const redisClient = require("../config/redisClient");

/**
 * @desc Listen to Firebase Realtime Database and store vitals in Redis buffer
 */
exports.listenToFirebaseVitals = () => {
    const vitalsRef = db.ref("vitals");

    vitalsRef.on("child_added", async (snapshot) => {
        const data = snapshot.val();
        const { serialNumber, ...vitals } = data;

        if (!serialNumber) return console.error("Missing serialNumber");

        // 👇 نحول البيانات JSON ونضيفها إلى list في Redis
        await redisClient.rPush(`vitals:${serialNumber}`, JSON.stringify(vitals));
        console.log(`📥 Buffered vitals for ${serialNumber} in Redis`);
    });
};
