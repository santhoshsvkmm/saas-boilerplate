const Joi = require('joi');
const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');

const validate = (schema) => (req, res, next) => {
  const validSchema = pick(schema, ['params', 'query', 'body']);
  const object = pick(req, Object.keys(validSchema));
  
  const { value, error } = Joi.validate(object, validSchema, {
    errors: { label: 'key' },
    abortEarly: false,
    allowUnknown: true
  });

  if (error) {
    const errorMessage = error.details.map((details) => ({
      message: details.message,
      field: details.context.key || details.context.label
    }));
    
    const apiErrorResponse = new ApiError(httpStatus.BAD_REQUEST, errorMessage);
    return next(apiErrorResponse.getErrorObject());
  }

  Object.keys(value).forEach((key) => {
    Object.assign(req[key], value[key]);
  });

  return next();
};

module.exports = validate;