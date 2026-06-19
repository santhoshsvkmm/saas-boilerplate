const Joi = require('joi');

const createTask = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    description: Joi.string().allow('', null),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().required().min(Joi.ref('startDate')),
    duration: Joi.number(),
    progress: Joi.number().min(0).max(100),
    status: Joi.string().valid('not-started', 'in-progress', 'completed', 'on-hold', 'blocked'),
    blocker_reason: Joi.string().allow('', null),
    effort: Joi.number().min(0),
    projectVersionId: Joi.number().integer().required(),
    phaseId: Joi.number().integer(),
  }),
};

const updateTask = {
  params: Joi.object().keys({
    id: Joi.number().integer(),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string(),
      description: Joi.string().allow('', null),
      startDate: Joi.date().iso(),
      endDate: Joi.date().iso(),
      duration: Joi.number(),
      progress: Joi.number().min(0).max(100),
      status: Joi.string().valid('not-started', 'in-progress', 'completed', 'on-hold', 'blocked'),
      blocker_reason: Joi.string().allow('', null),
      effort: Joi.number().min(0),
    })
    .min(1),
};

const addLabourerToTask = {
  params: Joi.object().keys({
    id: Joi.number().integer(),
  }),
  body: Joi.object().keys({
    labourerId: Joi.number().integer().required(),
    hours: Joi.number(), // Optional: hours assigned for this task
  }),
};

const removeLabourerFromTask = {
  params: Joi.object().keys({
    id: Joi.number().integer(),
    labourerId: Joi.number().integer(),
  }),
};

const getLookaheadsForTask = {
  params: Joi.object().keys({
    id: Joi.number().integer(),
  }),
};

module.exports = {
  createTask,
  updateTask,
  addLabourerToTask,
  removeLabourerFromTask,
  getLookaheadsForTask,
};