const redisClient = require('../services/redis.service');
const logger = require('../loggers/logger');

const clearCache = async (key) => {
  try {
    await redisClient.del(key);
    logger.info(`Cache cleared for key: ${key}`);
  } catch (error) {
    logger.error(`Error clearing cache for key ${key}:`, error);
  }
};

const clearCacheByTag = async (tag) => {
  const tagKey = `tag:${tag}`;
  try {
    const keysToClear = await redisClient.sMembers(tagKey);
    if (keysToClear.length > 0) {
      await redisClient.del(keysToClear);
    }
    await redisClient.del(tagKey); // Also remove the tag set itself
    logger.info(`Cache cleared for tag: ${tag}`);
  } catch (error) {
    logger.error(`Error clearing cache for tag ${tag}:`, error);
  }
};


module.exports = { clearCache, clearCacheByTag };