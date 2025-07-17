// const { createClient } = require("redis");

// const redisClient = createClient({
//     url: process.env.REDIS_URL || "redis://localhost:6379", // ممكن تعدلها حسب بيئتك
// });

// redisClient.on("error", (err) => {
//     console.error("Redis Client Error:", err);
// });

// redisClient.on("connect", () => {
//     console.log("Connected to Redis");
// });

// (async () => {
//     await redisClient.connect();
// })();

// module.exports = redisClient;
