const Joi = require('joi');
const { password } = require("./custom.validation");

const forgotPasswordValidation = {
    body: Joi.object().keys({
        email:Joi.string().required().email(),
    }),
  };

  const resetPasswordValidation = {
    body: Joi.object().keys({
        token: Joi.string().required(),
        newpassword: Joi.string().required().custom(password),
    }),
  };

  module.exports = { forgotPasswordValidation, resetPasswordValidation };