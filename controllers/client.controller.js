const db = require("../models");
const Client = db.client;
const Op = db.Sequelize.Op;
const catchAsync = require("../utils/catchAsync");
const logger = require('../loggers/logger');
const { clearCacheByTag } = require('../utils/cache.util');

// Create and Save a new Client
exports.create = catchAsync(async (req, res) => {
  const existingClient = await Client.findOne({ where: { email: req.body.email } });
  if (existingClient) {
    logger.warn(`Client creation failed: email '${req.body.email}' already exists.`);
    return res.status(409).send({ message: "Client with this email already exists." });
  }

  const data = await Client.create(req.body);
  logger.info(`Client created successfully with ID: ${data.id}`);
  await clearCacheByTag('clients');
  res.status(201).send(data);
});

// Retrieve all Clients from the database.
exports.findAll = catchAsync(async (req, res) => {
  logger.info('Retrieving all clients.');
  const data = await Client.findAll({
    where: { isDeleted: { [Op.ne]: true } }
  });
  res.send(data);
});

// Find a single Client with an id
exports.findOne = catchAsync(async (req, res) => {
  const id = req.params.id;
  logger.info(`Retrieving client with ID: ${id}`);
  const data = await Client.findOne({
    where: { id: id, isDeleted: { [Op.ne]: true } }
  });
  res.send(data);
});

// Update a Client by the id in the request
exports.update = catchAsync(async (req, res) => {
  const id = req.params.id;
  logger.info(`Attempting to update client with ID: ${id}`);

  const [num] = await Client.update(req.body, {
    where: { id: id }
  });

  if (num == 1) {
    logger.info(`Client updated successfully with ID: ${id}`);
    await clearCacheByTag('clients');
    res.send({
      message: "Client was updated successfully."
    });
  } else {
    res.send({
      message: `Cannot update Client with id=${id}. Maybe Client was not found or req.body is empty!`
    });
  }
});

// Delete a Client with the specified id in the request
exports.delete = catchAsync(async (req, res) => {
  const id = req.params.id;
  logger.info(`Attempting to soft-delete client with ID: ${id}`);

  const [num] = await Client.update({ isDeleted: true }, {
    where: { id: id }
  });

  if (num == 1) {
    logger.info(`Client soft-deleted successfully with ID: ${id}`);
    await clearCacheByTag('clients');
    res.send({
      message: "Client was deleted successfully!"
    });
  } else {
    res.send({
      message: `Cannot delete Client with id=${id}. Maybe Client was not found!`
    });
  }
});

// Delete all Clients from the database.
exports.deleteAll = catchAsync(async (req, res) => {
  logger.warn('Attempting to soft-delete all clients.');
  const [nums] = await Client.update({ isDeleted: true }, {
    where: {},
  });
  await clearCacheByTag('clients');
  logger.info(`${nums} clients were soft-deleted successfully.`);
  res.send({ message: `${nums} Clients were deleted successfully!` });
});