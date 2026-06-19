const redis = require('redis');
const logger = require('../loggers/logger');

const redisClient = redis.createClient({
  // For production, use a connection URL from environment variables
  // url: process.env.REDIS_URL 
});

redisClient.on('error', (err) => logger.error('Redis Client Error', err));

(async () => {
  await redisClient.connect();
  logger.info('Connected to Redis successfully!');
})();

module.exports = redisClient;