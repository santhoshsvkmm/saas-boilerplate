const Joi = require('joi');

const createLookahead = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().required().min(Joi.ref('startDate')),
    projectVersionId: Joi.number().integer().required(),
  }),
};

const addTasksToLookahead = {
  params: Joi.object().keys({
    id: Joi.number().integer(),
  }),
  body: Joi.object().keys({
    taskIds: Joi.array().items(Joi.number().integer()).min(1).required(),
  }),
};

const getLookaheads = {
  params: Joi.object().keys({
    projectVersionId: Joi.number().integer().required(),
  }),
};

const updateLookahead = {
  params: Joi.object().keys({
    id: Joi.number().integer(),
  }),
  body: Joi.object().keys({
    name: Joi.string(),
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso(),
    status: Joi.string().valid('planning', 'active', 'completed'),
  }).min(1),
};

const getProgressSummary = {
  params: Joi.object().keys({
    id: Joi.number().integer(),
  }),
};

const removeTaskFromLookahead = {
  params: Joi.object().keys({
    id: Joi.number().integer(),
    taskId: Joi.number().integer(),
  }),
};

const findUnplannedTasks = {
  params: Joi.object().keys({
    projectVersionId: Joi.number().integer().required(),
  }),
};

const getBurndownSummary = {
  params: Joi.object().keys({
    id: Joi.number().integer().required(),
  }),
};

const getVelocitySummary = {
  params: Joi.object().keys({
    projectVersionId: Joi.number().integer().required(),
  }),
};

const getBehindScheduleLookaheads = {
  // No params needed for this route
};

const getAtRiskLookaheads = {
  // No params needed for this route
};

const getBlockedLookaheads = {
  // No params needed for this route
};

const getProjectedEarlyLookaheads = {
  // No params needed for this route
};

module.exports = {
  createLookahead,
  addTasksToLookahead,
  getLookaheads,
  updateLookahead,
  getProgressSummary,
  removeTaskFromLookahead,
  findUnplannedTasks,
  getBurndownSummary,
  getVelocitySummary,
  getBehindScheduleLookaheads,
  getAtRiskLookaheads,
  getBlockedLookaheads,
  getProjectedEarlyLookaheads,
  moveTask: {
    params: Joi.object().keys({
      fromLookaheadId: Joi.number().integer().required(),
      taskId: Joi.number().integer().required(),
      toLookaheadId: Joi.number().integer().required(),
    }),
  },
};