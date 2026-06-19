const db = require("../models");
const MaterialTender = db.materialTender;
const Op = db.Sequelize.Op;
const catchAsync = require("../utils/catchAsync");
const logger = require('../loggers/logger');
const { clearCacheByTag } = require('../utils/cache.util');

// Create and Save a new Material Tender
exports.create = catchAsync(async (req, res) => {
  const data = await MaterialTender.create(req.body);
  logger.info(`Material Tender created successfully with ID: ${data.id}`);
  await clearCacheByTag('tenders');
  res.status(201).send(data);
});

// Retrieve all Material Tenders from the database.
exports.findAll = catchAsync(async (req, res) => {
  logger.info('Retrieving all material tenders.');
  const data = await MaterialTender.findAll({
    where: { isDeleted: { [Op.ne]: true } }
  });
  res.send(data);
});

// Find a single Material Tender with an id
exports.findOne = catchAsync(async (req, res) => {
  const id = req.params.id;
  logger.info(`Retrieving material tender with ID: ${id}`);
  const data = await MaterialTender.findOne({
    where: { id: id, isDeleted: { [Op.ne]: true } },
    include: [db.materialBidding] // Include associated bids
  });
  res.send(data);
});

// Retrieve all Tenders for a specific Organisation
exports.findAllByOrganisation = catchAsync(async (req, res) => {
  const organisationId = req.params.id;
  logger.info(`Retrieving all tenders for organisation ID: ${organisationId}`);
  const data = await MaterialTender.findAll({
    where: { organisation_id: organisationId, isDeleted: { [Op.ne]: true } }
  });
  res.send(data);
});

// Update a Material Tender by the id in the request
exports.update = catchAsync(async (req, res) => {
  const id = req.params.id;
  logger.info(`Attempting to update material tender with ID: ${id}`);

  const [num] = await MaterialTender.update(req.body, {
    where: { id: id }
  });

  if (num == 1) {
    logger.info(`Material Tender updated successfully with ID: ${id}`);
    await clearCacheByTag('tenders');
    await clearCacheByTag(`tender:${id}`);
    res.send({
      message: "Material Tender was updated successfully."
    });
  } else {
    res.send({
      message: `Cannot update Material Tender with id=${id}. Maybe it was not found or req.body is empty!`
    });
  }
});

// Delete a Material Tender with the specified id in the request
exports.delete = catchAsync(async (req, res) => {
  const id = req.params.id;
  logger.info(`Attempting to soft-delete material tender with ID: ${id}`);

  const [num] = await MaterialTender.update({ isDeleted: true }, {
    where: { id: id }
  });

  if (num == 1) {
    logger.info(`Material Tender soft-deleted successfully with ID: ${id}`);
    await clearCacheByTag('tenders');
    await clearCacheByTag(`tender:${id}`);
    res.send({
      message: "Material Tender was deleted successfully!"
    });
  } else {
    res.send({
      message: `Cannot delete Material Tender with id=${id}. Maybe it was not found!`
    });
  }
});