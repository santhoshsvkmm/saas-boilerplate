const Joi = require('joi');

const createLabour = {
  body: Joi.object().keys({
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    email: Joi.string().required().email(),
    phone_number: Joi.string().required(),
    address: Joi.string().required(),
    organisation_id: Joi.number().integer().required(),
    sub_contractor_id: Joi.number().integer().allow(null),
  }),
};

const updateLabour = {
  params: Joi.object().keys({
    id: Joi.number().integer(),
  }),
  body: Joi.object()
    .keys({
      first_name: Joi.string(),
      last_name: Joi.string(),
      email: Joi.string().email(),
      phone_number: Joi.string(),
      address: Joi.string(),
    })
    .min(1),
};

const getLabourerHoursSummary = {
  params: Joi.object().keys({
    id: Joi.number().integer(),
  }),
};

const getLabourerProjects = {
  params: Joi.object().keys({
    id: Joi.number().integer(),
  }),
};

module.exports = {
  createLabour,
  updateLabour,
  getLabourerHoursSummary,
  getLabourerProjects,
};