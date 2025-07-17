const redis = require('redis');

const redisClient = redis.createClient({
    url: process.env.REDIS_URL // مثال: redis://localhost:6379
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

(async () => {
    try {
        await redisClient.connect();
        console.log('Connected to Redis');
    } catch (err) {
        console.error('Failed to connect to Redis:', err);
    }
})();

module.exports = redisClient;