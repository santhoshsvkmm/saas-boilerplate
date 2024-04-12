const Joi = require('joi');


const organisationValidation = {
    body: Joi.object().keys({
      isVerified:Joi.boolean().required(),
      firstname:Joi.string().required(),
      lastname:Joi.string().required(),
      country:Joi.string().required(),
      city:Joi.string().required(),
      isActive:Joi.boolean().required(),
      organisationName:Joi.number().required()
    }),
  };


  module.exports = {organisationValidation}