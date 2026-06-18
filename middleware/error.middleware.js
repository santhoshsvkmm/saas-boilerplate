const logger = require('../loggers/logger');

const errorHandler = (err, req, res, next) => {
  let { statusCode = 500, message } = err;

  // For sequelize validation errors
  if (err.name && err.name.includes('Sequelize')) {
    statusCode = 400;
    message = err.errors.map(e => e.message).join(', ');
  }

  res.locals.errorMessage = message || 'An unexpected error occurred.';

  logger.error(`${statusCode} - ${res.locals.errorMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  logger.error(err.stack);

  res.status(statusCode).send({ message: res.locals.errorMessage });
};

module.exports = { errorHandler };