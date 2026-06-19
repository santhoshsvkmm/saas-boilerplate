const Joi = require('joi');

const getCriticalPath = {
  params: Joi.object().keys({
    id: Joi.number().integer().required(),
  }),
};

const getNonCriticalTasks = {
  params: Joi.object().keys({
    id: Joi.number().integer().required(),
  }),
};

const getPhaseSlackSummary = {
  params: Joi.object().keys({
    id: Joi.number().integer().required(),
  }),
};

const cloneProjectVersion = {
  params: Joi.object().keys({
    id: Joi.number().integer().required(),
  }),
  body: Joi.object().keys({
    newVersionName: Joi.string().required(),
  }),
};

const compareProjectVersions = {
  params: Joi.object().keys({
    sourceVersionId: Joi.number().integer().required(),
    targetVersionId: Joi.number().integer().required(),
  }),
};

module.exports = {
  getCriticalPath,
  getNonCriticalTasks,
  getPhaseSlackSummary,
  cloneProjectVersion,
  compareProjectVersions,
};