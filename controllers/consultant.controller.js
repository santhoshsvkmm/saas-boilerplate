const db = require("../models");
const Consultant = db.consultant;
const Op = db.Sequelize.Op;
const catchAsync = require("../utils/catchAsync");
const logger = require('../loggers/logger');
const { clearCacheByTag } = require('../utils/cache.util');

// Create and Save a new Consultant
exports.create = catchAsync(async (req, res) => {
  const existingConsultant = await Consultant.findOne({ where: { email: req.body.email } });
  if (existingConsultant) {
    logger.warn(`Consultant creation failed: email '${req.body.email}' already exists.`);
    return res.status(409).send({ message: "Consultant with this email already exists." });
  }

  const data = await Consultant.create(req.body);
  logger.info(`Consultant created successfully with ID: ${data.id}`);
  await clearCacheByTag('consultants');
  res.status(201).send(data);
});

// Retrieve all Consultants from the database.
exports.findAll = catchAsync(async (req, res) => {
  logger.info('Retrieving all consultants.');
  const data = await Consultant.findAll({
    where: { isDeleted: { [Op.ne]: true } }
  });
  res.send(data);
});

// Find a single Consultant with an id
exports.findOne = catchAsync(async (req, res) => {
  const id = req.params.id;
  logger.info(`Retrieving consultant with ID: ${id}`);
  const data = await Consultant.findOne({
    where: { id: id, isDeleted: { [Op.ne]: true } }
  });
  res.send(data);
});

// Retrieve all Consultants for a specific Organisation
exports.findAllByOrganisation = catchAsync(async (req, res) => {
  const organisationId = req.params.id;
  logger.info(`Retrieving all consultants for organisation ID: ${organisationId}`);
  const data = await Consultant.findAll({
    where: { organisation_id: organisationId, isDeleted: { [Op.ne]: true } }
  });
  res.send(data);
});

// Update a Consultant by the id in the request
exports.update = catchAsync(async (req, res) => {
  const id = req.params.id;
  logger.info(`Attempting to update consultant with ID: ${id}`);

  const [num] = await Consultant.update(req.body, {
    where: { id: id }
  });

  if (num == 1) {
    logger.info(`Consultant updated successfully with ID: ${id}`);
    await clearCacheByTag('consultants');
    res.send({
      message: "Consultant was updated successfully."
    });
  } else {
    res.send({
      message: `Cannot update Consultant with id=${id}. Maybe Consultant was not found or req.body is empty!`
    });
  }
});

// Delete a Consultant with the specified id in the request
exports.delete = catchAsync(async (req, res) => {
  const id = req.params.id;
  logger.info(`Attempting to soft-delete consultant with ID: ${id}`);

  const [num] = await Consultant.update({ isDeleted: true }, {
    where: { id: id }
  });

  if (num == 1) {
    logger.info(`Consultant soft-deleted successfully with ID: ${id}`);
    await clearCacheByTag('consultants');
    res.send({
      message: "Consultant was deleted successfully!"
    });
  } else {
    res.send({
      message: `Cannot delete Consultant with id=${id}. Maybe Consultant was not found!`
    });
  }
});

// Delete all Consultants from the database.
exports.deleteAll = catchAsync(async (req, res) => {
  logger.warn('Attempting to soft-delete all consultants.');
  const [nums] = await Consultant.update({ isDeleted: true }, {
    where: {},
  });
  await clearCacheByTag('consultants');
  logger.info(`${nums} consultants were soft-deleted successfully.`);
  res.send({ message: `${nums} Consultants were deleted successfully!` });
});

exports.deleteAllByOrganisation = catchAsync(async (req, res) => {
  const organisationId = req.params.id;
  logger.warn(`Attempting to soft-delete all consultants for organisation ID: ${organisationId}`);
  const [nums] = await Consultant.update({ isDeleted: true }, {
    where: { organisation_id: organisationId },
  });
  await clearCacheByTag('consultants');
  logger.info(`${nums} consultants for organisation ID ${organisationId} were soft-deleted successfully.`);
  res.send({ message: `${nums} Consultants were deleted successfully!` });
});