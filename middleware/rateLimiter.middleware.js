const rateLimit = require("express-rate-limit");

const rateLimitMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  statusCode: 429,
  message: {
    status: 429,
    error: 'Too Many Requests',
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  },
  keyGenerator: (req) => {
    return req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  }
});

module.exports = rateLimitMiddleware;