const db = require("../models");
const Subcontractor = db.subContractor;
const Op = db.Sequelize.Op;
const catchAsync = require("../utils/catchAsync");
const logger = require('../loggers/logger');
const { clearCacheByTag } = require('../utils/cache.util');

// Create and Save a new Subcontractor
exports.create = catchAsync(async (req, res) => {
  const existingSubcontractor = await Subcontractor.findOne({ where: { email: req.body.email } });
  if (existingSubcontractor) {
    logger.warn(`Subcontractor creation failed: email '${req.body.email}' already exists.`);
    return res.status(409).send({ message: "Subcontractor with this email already exists." });
  }

  const data = await Subcontractor.create(req.body);
  logger.info(`Subcontractor created successfully with ID: ${data.id}`);
  await clearCacheByTag('subcontractors');
  res.status(201).send(data);
});

// Retrieve all Subcontractors from the database.
exports.findAll = catchAsync(async (req, res) => {
  logger.info('Retrieving all subcontractors.');
  const data = await Subcontractor.findAll({
    where: { isDeleted: { [Op.ne]: true } }
  });
  res.send(data);
});

// Find a single Subcontractor with an id
exports.findOne = catchAsync(async (req, res) => {
  const id = req.params.id;
  logger.info(`Retrieving subcontractor with ID: ${id}`);
  const data = await Subcontractor.findOne({
    where: { id: id, isDeleted: { [Op.ne]: true } }
  });
  res.send(data);
});

// Retrieve all Subcontractors for a specific Organisation
exports.findAllByOrganisation = catchAsync(async (req, res) => {
  const organisationId = req.params.id;
  logger.info(`Retrieving all subcontractors for organisation ID: ${organisationId}`);
  const data = await Subcontractor.findAll({
    where: { organisation_id: organisationId, isDeleted: { [Op.ne]: true } }
  });
  res.send(data);
});

// Update a Subcontractor by the id in the request
exports.update = catchAsync(async (req, res) => {
  const id = req.params.id;
  logger.info(`Attempting to update subcontractor with ID: ${id}`);

  const [num] = await Subcontractor.update(req.body, {
    where: { id: id }
  });

  if (num == 1) {
    logger.info(`Subcontractor updated successfully with ID: ${id}`);
    await clearCacheByTag('subcontractors');
    res.send({
      message: "Subcontractor was updated successfully."
    });
  } else {
    res.send({
      message: `Cannot update Subcontractor with id=${id}. Maybe Subcontractor was not found or req.body is empty!`
    });
  }
});

// Delete a Subcontractor with the specified id in the request
exports.delete = catchAsync(async (req, res) => {
  const id = req.params.id;
  logger.info(`Attempting to soft-delete subcontractor with ID: ${id}`);

  const [num] = await Subcontractor.update({ isDeleted: true }, {
    where: { id: id }
  });

  if (num == 1) {
    logger.info(`Subcontractor soft-deleted successfully with ID: ${id}`);
    await clearCacheByTag('subcontractors');
    res.send({
      message: "Subcontractor was deleted successfully!"
    });
  } else {
    res.send({
      message: `Cannot delete Subcontractor with id=${id}. Maybe Subcontractor was not found!`
    });
  }
});

// Delete all Subcontractors from the database.
exports.deleteAll = catchAsync(async (req, res) => {
  logger.warn('Attempting to soft-delete all subcontractors.');
  const [nums] = await Subcontractor.update({ isDeleted: true }, {
    where: {},
  });
  await clearCacheByTag('subcontractors');
  logger.info(`${nums} subcontractors were soft-deleted successfully.`);
  res.send({ message: `${nums} Subcontractors were deleted successfully!` });
});

exports.deleteAllByOrganisation = catchAsync(async (req, res) => {
  const organisationId = req.params.id;
  logger.warn(`Attempting to soft-delete all subcontractors for organisation ID: ${organisationId}`);
  const [nums] = await Subcontractor.update({ isDeleted: true }, {
    where: { organisation_id: organisationId },
  });
  await clearCacheByTag('subcontractors');
  logger.info(`${nums} subcontractors for organisation ID ${organisationId} were soft-deleted successfully.`);
  res.send({ message: `${nums} Subcontractors were deleted successfully!` });
});