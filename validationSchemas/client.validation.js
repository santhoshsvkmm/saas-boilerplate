const Joi = require('joi');
const { password } = require('./custom.validation');

const createClient = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    client_organisation_name: Joi.string().required(),
    contact_person_firstname: Joi.string().required(),
    contact_person_lastname: Joi.string().required(),
  }),
};

const updateClient = {
  params: Joi.object().keys({
    id: Joi.number().integer(),
  }),
  body: Joi.object()
    .keys({
      email: Joi.string().email(),
      client_organisation_name: Joi.string(),
      contact_person_firstname: Joi.string(),
      contact_person_lastname: Joi.string(),
    })
    .min(1),
};

module.exports = {
  createClient,
  updateClient,
};