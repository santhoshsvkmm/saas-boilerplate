const Joi = require('joi');

const createProject = {
  body: Joi.object().keys({
    projectName: Joi.string().required(),
    description: Joi.string().allow('', null),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().required().min(Joi.ref('startDate')),
    status: Joi.string().valid('planning', 'in-progress', 'completed', 'on-hold'),
    userId: Joi.number().integer().required(),
    organisationId: Joi.number().integer().required(),
  }),
};

const updateProject = {
  params: Joi.object().keys({
    id: Joi.number().integer(),
  }),
  body: Joi.object()
    .keys({
      projectName: Joi.string(),
      description: Joi.string().allow('', null),
      startDate: Joi.date().iso(),
      endDate: Joi.date().iso(),
      status: Joi.string().valid('planning', 'in-progress', 'completed', 'on-hold'),
    })
    .min(1),
};

const addConsultantToProject = {
  params: Joi.object().keys({
    projectId: Joi.number().integer(),
  }),
  body: Joi.object().keys({
    consultantId: Joi.number().integer().required(),
  }),
};

const generatePlan = {
  params: Joi.object().keys({
    projectId: Joi.number().integer(),
  }),
  body: Joi.object().keys({
    plannedDate: Joi.date().iso(), // Optional: allows setting a specific date for the plan
  }),
};

const getProjectHoursSummary = {
  params: Joi.object().keys({
    id: Joi.number().integer(),
  }),
};

const setActiveProjectVersion = {
  params: Joi.object().keys({
    projectId: Joi.number().integer().required(),
    versionId: Joi.number().integer().required(),
  }),
};

module.exports = {
  createProject,
  updateProject,
  addConsultantToProject,
  generatePlan,
  getProjectHoursSummary,
  setActiveProjectVersion,
};