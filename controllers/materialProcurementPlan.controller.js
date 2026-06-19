const db = require("../models");
const MaterialProcurementPlan = db.materialProcurementPlan;
const Op = db.Sequelize.Op;
const catchAsync = require("../utils/catchAsync");
const logger = require('../loggers/logger');
const { clearCacheByTag } = require('../utils/cache.util');

// Create and Save a new Material Procurement Plan
exports.create = catchAsync(async (req, res) => {
  const data = await MaterialProcurementPlan.create(req.body);
  logger.info(`Material Procurement Plan created successfully with ID: ${data.id}`);
  await clearCacheByTag('procurement-plans');
  await clearCacheByTag(`project-procurement-plans:${data.projectId}`);
  res.status(201).send(data);
});

// Retrieve all Material Procurement Plans from the database.
exports.findAll = catchAsync(async (req, res) => {
  logger.info('Retrieving all material procurement plans.');
  const data = await MaterialProcurementPlan.findAll({
    where: { isDeleted: { [Op.ne]: true } }
  });
  res.send(data);
});

// Find a single Material Procurement Plan with an id
exports.findOne = catchAsync(async (req, res) => {
  const id = req.params.id;
  logger.info(`Retrieving material procurement plan with ID: ${id}`);
  const data = await MaterialProcurementPlan.findOne({
    where: { id: id, isDeleted: { [Op.ne]: true } }
  });
  res.send(data);
});

// Retrieve all Procurement Plans for a specific Project
exports.findAllByProject = catchAsync(async (req, res) => {
  const projectId = req.params.id;
  logger.info(`Retrieving all procurement plans for project ID: ${projectId}`);
  const data = await MaterialProcurementPlan.findAll({
    where: { projectId: projectId, isDeleted: { [Op.ne]: true } }
  });
  res.send(data);
});

// Update a Material Procurement Plan by the id in the request
exports.update = catchAsync(async (req, res) => {
  const id = req.params.id;
  logger.info(`Attempting to update material procurement plan with ID: ${id}`);

  const plan = await MaterialProcurementPlan.findByPk(id);
  if (!plan) {
    return res.status(404).send({ message: `Cannot find Plan with id=${id}.` });
  }

  const [num] = await MaterialProcurementPlan.update(req.body, {
    where: { id: id }
  });

  if (num == 1) {
    logger.info(`Material Procurement Plan updated successfully with ID: ${id}`);
    await clearCacheByTag('procurement-plans');
    await clearCacheByTag(`project-procurement-plans:${plan.projectId}`);
    res.send({
      message: "Material Procurement Plan was updated successfully."
    });
  } else {
    res.send({
      message: `Cannot update Material Procurement Plan with id=${id}. Maybe it was not found or req.body is empty!`
    });
  }
});

// Delete a Material Procurement Plan with the specified id in the request
exports.delete = catchAsync(async (req, res) => {
  const id = req.params.id;
  logger.info(`Attempting to soft-delete material procurement plan with ID: ${id}`);

  const plan = await MaterialProcurementPlan.findByPk(id);
  if (!plan) {
    return res.status(404).send({ message: `Cannot find Plan with id=${id}.` });
  }

  const [num] = await MaterialProcurementPlan.update({ isDeleted: true }, {
    where: { id: id }
  });

  if (num == 1) {
    logger.info(`Material Procurement Plan soft-deleted successfully with ID: ${id}`);
    await clearCacheByTag('procurement-plans');
    await clearCacheByTag(`project-procurement-plans:${plan.projectId}`);
    res.send({
      message: "Material Procurement Plan was deleted successfully!"
    });
  } else {
    res.send({
      message: `Cannot delete Material Procurement Plan with id=${id}.`
    });
  }
});