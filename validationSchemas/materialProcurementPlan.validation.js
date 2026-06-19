const Joi = require('joi');

const createProcurementPlan = {
  body: Joi.object().keys({
    material_id: Joi.number().integer().required(),
    planned_quantity: Joi.number().required(),
    planned_date: Joi.date().iso().required(),
    projectId: Joi.number().integer().required(),
  }),
};

const updateProcurementPlan = {
  params: Joi.object().keys({
    id: Joi.number().integer(),
  }),
  body: Joi.object()
    .keys({
      planned_quantity: Joi.number(),
      planned_date: Joi.date().iso(),
    })
    .min(1),
};

module.exports = {
  createProcurementPlan,
  updateProcurementPlan,
};