const Joi = require('joi');

const createDepartment = {
  body: Joi.object().keys({
    departmentName: Joi.string().required(),
    organizationId: Joi.number().integer().required(),
  }),
};

const updateDepartment = {
  params: Joi.object().keys({
    id: Joi.number().integer(),
  }),
  body: Joi.object()
    .keys({
      departmentName: Joi.string(),
    })
    .min(1),
};

module.exports = {
  createDepartment,
  updateDepartment,
};