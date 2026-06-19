const Joi = require('joi');
const { password } = require('./custom.validation');

const createSubcontractor = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    subcontractor_organisation_name: Joi.string().required(),
    contact_person_firstname: Joi.string().required(),
    contact_person_lastname: Joi.string().required(),
    organisation_id: Joi.number().integer().required(),
  }),
};

const updateSubcontractor = {
  params: Joi.object().keys({
    id: Joi.number().integer(),
  }),
  body: Joi.object()
    .keys({
      email: Joi.string().email(),
      subcontractor_organisation_name: Joi.string(),
      contact_person_firstname: Joi.string(),
      contact_person_lastname: Joi.string(),
    })
    .min(1),
};

module.exports = {
  createSubcontractor,
  updateSubcontractor,
};