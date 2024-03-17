const Joi = require('joi');
const { password } = require('./custom.validation');


const registerValidation = {
    body: Joi.object().keys({
      email:Joi.string().required().email(),
      username: Joi.string().required().email(),
      password: Joi.string().required().custom(password),
      fullname: Joi.string().required(),
      firstname: Joi.string().required(),
      lastname: Joi.string().required(),
      role:Joi.string().required(),
      active:Joi.boolean().required()
    }),
  };


  module.exports = {registerValidation}