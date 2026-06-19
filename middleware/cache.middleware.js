const redisClient = require('../services/redis.service.js');
const logger = require('../loggers/logger');

const cacheMiddleware = (tag) => (req, res, next) => {
  if (!tag) {
    // If no tag is provided, skip caching
    return next();
  }
  const cacheKey = req.originalUrl;

  try {
    redisClient.get(cacheKey).then(cachedData => {
      if (cachedData) {
        logger.info(`Cache hit for key: ${cacheKey}`);
        return res.status(200).send(JSON.parse(cachedData));
      } else {
        logger.info(`Cache miss for key: ${cacheKey}`);
        // Monkey-patch res.send to cache the response before sending it
        const originalSend = res.send;
        res.send = (body) => {
          const tagKey = `tag:${tag}`;
          const pipeline = redisClient.multi();
          pipeline.setEx(cacheKey, 3600, body); // Cache the result for 1 hour
          pipeline.sAdd(tagKey, cacheKey); // Add the cache key to the tag set
          pipeline.exec();
          logger.info(`Data cached for key: ${cacheKey} with tag: ${tag}`);
          originalSend.call(res, body);
        };
        next();
      }
    }).catch(error => {
        logger.error('Redis cache middleware error:', error);
        next(); // On error, proceed without caching
    })

  } catch (error) {
    logger.error('Redis cache middleware error:', error);
    next(); // On error, proceed without caching
  }
};

module.exports = { cacheMiddleware };