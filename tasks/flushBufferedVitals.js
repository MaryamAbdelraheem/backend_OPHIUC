const redisClient = require('../config/redisClient');
const { Vitals, Device } = require('../models');

const flushBufferedVitals = async () => {
    const keys = await redisClient.keys("vitals:*");

    for (const key of keys) {
        const serialNumber = key.split(":")[1];
        const vitalsJsonArray = await redisClient.lRange(key, 0, -1);

        if (vitalsJsonArray.length === 0) continue;

        const vitalsArray = vitalsJsonArray.map(JSON.parse);

        try {
            const device = await Device.findOne({ where: { serialNumber } });
            if (!device || !device.patientId) {
                console.warn(`Device not linked: ${serialNumber}`);
                continue;
            }

            const averageVitals = {};
            const fields = ['Heart_Rate', 'Oxygen_Saturation', 'Snoring', 'AHI', 'BMI', 'Age'];

            fields.forEach(field => {
                const sum = vitalsArray.reduce((acc, item) => acc + (item[field] || 0), 0);
                averageVitals[field] = sum / vitalsArray.length;
            });

            averageVitals.Gender = vitalsArray[vitalsArray.length - 1].Gender;
            averageVitals.severity = Math.max(...vitalsArray.map(v => v.severity || 0));

            const vitals = await Vitals.create({
                patientId: device.patientId,
                deviceId: device.deviceId,
                ...averageVitals,
                source: "device",
            });

            if (global.io) {
                global.io.emit("newVitals", {
                    patientId: device.patientId,
                    vitals,
                });
            }

            console.log(`✅ Saved Redis-Buffered vitals for ${serialNumber}`);
        } catch (err) {
            console.error(`❌ Failed to save vitals for ${serialNumber}:`, err.message);
        }

        // 🧹 امسح البيانات من Redis بعد التخزين
        await redisClient.del(key);
    }
};

// ⏱ شغّل التفريغ كل 30 دقيقة
setInterval(flushBufferedVitals, 30 * 60 * 1000);
