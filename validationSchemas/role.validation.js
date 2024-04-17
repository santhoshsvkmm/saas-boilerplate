const Joi = require("joi");

const roleValidation = {
  body: Joi.object().keys({
    role_name: Joi.string().required(),
    description: Joi.string().required(),
    is_active: Joi.boolean().required(),
    organisation_id: Joi.number().required(),
    feature_ids: Joi.array().min(1).items(Joi.number()).required(),
  }),
};

module.exports = { roleValidation };
