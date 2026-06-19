const db = require("../models");
const Supplier = db.supplier;
const Op = db.Sequelize.Op;
const catchAsync = require("../utils/catchAsync");
const logger = require('../loggers/logger');
const { clearCacheByTag } = require('../utils/cache.util');

// Create and Save a new Supplier
exports.create = catchAsync(async (req, res) => {
  const existingSupplier = await Supplier.findOne({ where: { email: req.body.email } });
  if (existingSupplier) {
    logger.warn(`Supplier creation failed: email '${req.body.email}' already exists.`);
    return res.status(409).send({ message: "Supplier with this email already exists." });
  }

  const data = await Supplier.create(req.body);
  logger.info(`Supplier created successfully with ID: ${data.id}`);
  await clearCacheByTag('suppliers');
  res.status(201).send(data);
});

// Retrieve all Suppliers from the database.
exports.findAll = catchAsync(async (req, res) => {
  logger.info('Retrieving all suppliers.');
  const data = await Supplier.findAll({
    where: { isDeleted: { [Op.ne]: true } }
  });
  res.send(data);
});

// Find a single Supplier with an id
exports.findOne = catchAsync(async (req, res) => {
  const id = req.params.id;
  logger.info(`Retrieving supplier with ID: ${id}`);
  const data = await Supplier.findOne({
    where: { id: id, isDeleted: { [Op.ne]: true } }
  });
  res.send(data);
});

// Retrieve all Suppliers for a specific Organisation
exports.findAllByOrganisation = catchAsync(async (req, res) => {
  const organisationId = req.params.id;
  logger.info(`Retrieving all suppliers for organisation ID: ${organisationId}`);
  const data = await Supplier.findAll({
    where: { organisation_id: organisationId, isDeleted: { [Op.ne]: true } }
  });
  res.send(data);
});

// Update a Supplier by the id in the request
exports.update = catchAsync(async (req, res) => {
  const id = req.params.id;
  logger.info(`Attempting to update supplier with ID: ${id}`);

  const [num] = await Supplier.update(req.body, {
    where: { id: id }
  });

  if (num == 1) {
    logger.info(`Supplier updated successfully with ID: ${id}`);
    await clearCacheByTag('suppliers');
    res.send({
      message: "Supplier was updated successfully."
    });
  } else {
    res.send({
      message: `Cannot update Supplier with id=${id}. Maybe Supplier was not found or req.body is empty!`
    });
  }
});

// Delete a Supplier with the specified id in the request
exports.delete = catchAsync(async (req, res) => {
  const id = req.params.id;
  logger.info(`Attempting to soft-delete supplier with ID: ${id}`);

  const [num] = await Supplier.update({ isDeleted: true }, {
    where: { id: id }
  });

  if (num == 1) {
    logger.info(`Supplier soft-deleted successfully with ID: ${id}`);
    await clearCacheByTag('suppliers');
    res.send({
      message: "Supplier was deleted successfully!"
    });
  } else {
    res.send({
      message: `Cannot delete Supplier with id=${id}. Maybe Supplier was not found!`
    });
  }
});

// Delete all Suppliers from the database.
exports.deleteAll = catchAsync(async (req, res) => {
  logger.warn('Attempting to soft-delete all suppliers.');
  const [nums] = await Supplier.update({ isDeleted: true }, {
    where: {},
  });
  await clearCacheByTag('suppliers');
  logger.info(`${nums} suppliers were soft-deleted successfully.`);
  res.send({ message: `${nums} Suppliers were deleted successfully!` });
});

exports.deleteAllByOrganisation = catchAsync(async (req, res) => {
  const organisationId = req.params.id;
  logger.warn(`Attempting to soft-delete all suppliers for organisation ID: ${organisationId}`);
  const [nums] = await Supplier.update({ isDeleted: true }, {
    where: { organisation_id: organisationId },
  });
  await clearCacheByTag('suppliers');
  logger.info(`${nums} suppliers for organisation ID ${organisationId} were soft-deleted successfully.`);
  res.send({ message: `${nums} Suppliers were deleted successfully!` });
});