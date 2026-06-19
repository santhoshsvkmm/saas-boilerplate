const db = require("../models");
const Phase = db.phase;
const Op = db.Sequelize.Op;
const catchAsync = require("../utils/catchAsync");
const logger = require('../loggers/logger');
const { clearCacheByTag } = require('../utils/cache.util');

// Create and Save a new Phase
exports.create = catchAsync(async (req, res) => {
  const data = await Phase.create(req.body);
  logger.info(`Phase created successfully with ID: ${data.id}`);
  await clearCacheByTag('phases');
  await clearCacheByTag(`project-version-phases:${data.projectVersionId}`);
  res.status(201).send(data);
});

// Retrieve all Phases from the database.
exports.findAll = catchAsync(async (req, res) => {
  logger.info('Retrieving all phases.');
  const data = await Phase.findAll({ where: { isDeleted: { [Op.ne]: true } } });
  res.send(data);
});

// Find a single Phase with an id
exports.findOne = catchAsync(async (req, res) => {
  const id = req.params.id;
  logger.info(`Retrieving phase with ID: ${id}`);
  const data = await Phase.findOne({ where: { id: id, isDeleted: { [Op.ne]: true } } });
  res.send(data);
});

// Retrieve all Phases for a specific Project Version
exports.findAllByProjectVersion = catchAsync(async (req, res) => {
  const projectVersionId = req.params.id;
  logger.info(`Retrieving all phases for project version ID: ${projectVersionId}`);
  const data = await Phase.findAll({
    where: { projectVersionId: projectVersionId, isDeleted: { [Op.ne]: true } }
  });
  res.send(data);
});

// Update a Phase by the id in the request
exports.update = catchAsync(async (req, res) => {
  const id = req.params.id;
  logger.info(`Attempting to update phase with ID: ${id}`);

  const phase = await Phase.findByPk(id);
  if (!phase) {
    return res.status(404).send({ message: `Cannot find Phase with id=${id}.` });
  }

  const [num] = await Phase.update(req.body, { where: { id: id } });

  if (num == 1) {
    logger.info(`Phase updated successfully with ID: ${id}`);
    await clearCacheByTag('phases');
    await clearCacheByTag(`project-version-phases:${phase.projectVersionId}`);
    res.send({ message: "Phase was updated successfully." });
  } else {
    res.send({ message: `Cannot update Phase with id=${id}. Maybe it was not found or req.body is empty!` });
  }
});

// Delete a Phase with the specified id in the request
exports.delete = catchAsync(async (req, res) => {
  const id = req.params.id;
  logger.info(`Attempting to soft-delete phase with ID: ${id}`);

  const phase = await Phase.findByPk(id);
  if (!phase) {
    return res.status(404).send({ message: `Cannot find Phase with id=${id}.` });
  }

  const [num] = await Phase.update({ isDeleted: true }, { where: { id: id } });

  if (num == 1) {
    logger.info(`Phase soft-deleted successfully with ID: ${id}`);
    await clearCacheByTag('phases');
    await clearCacheByTag(`project-version-phases:${phase.projectVersionId}`);
    res.send({ message: "Phase was deleted successfully!" });
  } else {
    res.send({ message: `Cannot delete Phase with id=${id}.` });
  }
});