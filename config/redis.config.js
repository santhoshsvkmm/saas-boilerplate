require('dotenv').config();
const redis = require('redis');


const redisClient = redis.createClient({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD
  })


  redisClient.on('connect', () => {
    console.log('Connected to Redis');
  });

  redisClient.on('error', (err) => {
    console.error('Error connecting to Redis:', err);
  });


  module.exports = redisClient;