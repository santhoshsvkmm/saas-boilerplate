const Joi = require("joi");
const { password } = require("./custom.validation");

const organisationValidation = {
  body: Joi.object().keys({
    isVerified: Joi.boolean().required(),
    firstname: Joi.string().required(),
    lastname: Joi.string().required(),
    country: Joi.string().required(),
    city: Joi.string().required(),
    isActive: Joi.boolean().required(),
    organisationName: Joi.number().required(),
  }),
};

const organisationVerificationValidation = {
  body: Joi.object().keys({
    token: Joi.string().required(),
    password: Joi.string().required().custom(password),
  }),
};

module.exports = { organisationValidation, organisationVerificationValidation };
