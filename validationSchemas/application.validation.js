const Joi = require('joi');

const createApplication = {
  body: Joi.object().keys({
    reason: Joi.string().required(),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().required().min(Joi.ref('startDate')),
    type: Joi.string().required(),
    userId: Joi.number().integer().required(),
  }),
};

const updateApplication = {
  params: Joi.object().keys({
    id: Joi.number().integer(),
  }),
  body: Joi.object()
    .keys({
      reason: Joi.string(),
      startDate: Joi.date().iso(),
      endDate: Joi.date().iso().min(Joi.ref('startDate')),
      status: Joi.string().valid('pending', 'approved', 'rejected'),
      type: Joi.string(),
    })
    .min(1),
};

module.exports = {
  createApplication,
  updateApplication,
};