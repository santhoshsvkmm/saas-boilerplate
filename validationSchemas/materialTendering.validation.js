const Joi = require('joi');

const createTender = {
  body: Joi.object().keys({
    title: Joi.string().required(),
    materialDetails: Joi.object().required(),
    submissionDeadline: Joi.date().iso().required(),
    terms: Joi.string().required(),
    is_open_tender: Joi.boolean().required(),
    project_id: Joi.number().integer(),
    organisation_id: Joi.number().integer().required(),
    status: Joi.string().valid('active', 'pending', 'expired', 'terminated'),
  }),
};

const updateTender = {
  params: Joi.object().keys({
    id: Joi.number().integer(),
  }),
  body: Joi.object()
    .keys({
      title: Joi.string(),
      materialDetails: Joi.object(),
      submissionDeadline: Joi.date().iso(),
      terms: Joi.string(),
      status: Joi.string().valid('active', 'pending', 'expired', 'terminated', 'awarded'),
    })
    .min(1),
};

module.exports = {
  createTender,
  updateTender,
};