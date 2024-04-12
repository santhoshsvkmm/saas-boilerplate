const Joi = require('joi');


const featureValidation = {
    body: Joi.object().keys({
      feature_name:Joi.string().required(),
      description:Joi.string().required(),
      is_active:Joi.boolean().required(),
      organisation_id:Joi.number().required()
    }),
  };


  module.exports = {featureValidation}