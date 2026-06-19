const Joi = require('joi');

const clockIn = {
  body: Joi.object().keys({
    labour_id: Joi.number().integer().required(),
    project_id: Joi.number().integer().required(),
  }),
};

const clockOut = {
  body: Joi.object().keys({
    labour_id: Joi.number().integer().required(),
  }),
};

const getHistory = {
  params: Joi.object().keys({
    labourerId: Joi.number().integer().required(),
  }),
};

const getHoursSummaryForProject = {
  params: Joi.object().keys({
    labourerId: Joi.number().integer().required(),
    projectId: Joi.number().integer().required(),
  }),
};

const getProjectClockedIn = {
  params: Joi.object().keys({
    projectId: Joi.number().integer().required(),
  }),
};

const getProjectHoursSummary = {
  params: Joi.object().keys({
    projectId: Joi.number().integer().required(),
  }),
};

const getProjectHoursByLabourer = {
  params: Joi.object().keys({
    projectId: Joi.number().integer().required(),
  }),
};

const getWeeklyTimesheet = {
  params: Joi.object().keys({
    labourerId: Joi.number().integer().required(),
  }),
  query: Joi.object().keys({
    weekOf: Joi.date().iso().required(), // A date within the desired week
  }),
};

const downloadHistory = {
  params: Joi.object().keys({
    labourerId: Joi.number().integer().required(),
  }),
  query: Joi.object().keys({
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')),
    password: Joi.string().min(4), // Optional password for the archive
  }),
};

const downloadWeeklyTimesheet = {
  params: Joi.object().keys({
    labourerId: Joi.number().integer().required(),
  }),
  query: Joi.object().keys({
    weekOf: Joi.date().iso().required(),
    password: Joi.string().min(4), // Optional password for the archive
  }),
};

module.exports = {
  clockIn,
  clockOut,
  getHistory,
  getHoursSummaryForProject,
  getProjectClockedIn,
  getProjectHoursSummary,
  getProjectHoursByLabourer,
  getWeeklyTimesheet,
  downloadHistory,
  downloadWeeklyTimesheet,
};