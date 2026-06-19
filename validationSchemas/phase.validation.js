const Joi = require('joi');

const createPhase = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().required().min(Joi.ref('startDate')),
    projectVersionId: Joi.number().integer().required(),
  }),
};

const updatePhase = {
  params: Joi.object().keys({
    id: Joi.number().integer(),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string(),
      startDate: Joi.date().iso(),
      endDate: Joi.date().iso().min(Joi.ref('startDate')),
    })
    .min(1),
};

module.exports = {
  createPhase,
  updatePhase,
};