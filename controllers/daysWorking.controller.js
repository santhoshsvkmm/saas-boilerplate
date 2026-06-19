const db = require("../models");
const DaysWorking = db.daysWorking;
const Op = db.Sequelize.Op;
const catchAsync = require("../utils/catchAsync");
const logger = require('../loggers/logger');

// Create and Save a new Working Day
exports.create = catchAsync(async (req, res) => {
  // Validate request
  if (!req.body) {
    return res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  // Create a Working Day
  const daysWorking = {
    day: req.body.day,
    startingHour: req.body.startingHour,
    endingHour: req.body.endingHour,
    organizationId: req.body.organizationId
  };

  // Save Working Day in the database
  const data = await DaysWorking.create(daysWorking);
  logger.info(`Working day created successfully with ID: ${data.id}`);
  res.status(201).send(data);
});

// Retrieve all Working Days from the database.
exports.findAll = catchAsync(async (req, res) => {
  logger.info('Retrieving all working days.');
  const data = await DaysWorking.findAll({
    where: { isDeleted: { [Op.ne]: true } }
  });
  res.send(data);
});

//Retrieve all Working Days By Organization Id
exports.findAllByOrgId = catchAsync(async (req, res) => {
  const organizationId = req.params.id;
  logger.info(`Retrieving all working days for organisation ID: ${organizationId}`);
  const data = await DaysWorking.findAll({ 
    where: { organizationId: organizationId, isDeleted: { [Op.ne]: true } } 
  });
  res.send(data);
});

// Find a single Working Day with an id
exports.findOne = catchAsync(async (req, res) => {
  const id = req.params.id;
  logger.info(`Retrieving working day with ID: ${id}`);
  const data = await DaysWorking.findByPk(id);
  res.send(data);
});

// Update a Working Day by the id in the request
exports.update = catchAsync(async (req, res) => {
  const id = req.params.id;
  logger.info(`Attempting to update working day with ID: ${id}`);

  const [num] = await DaysWorking.update(req.body, {
    where: { id: id }
  });

  if (num == 1) {
    logger.info(`Working day updated successfully with ID: ${id}`);
    res.send({
      message: "Working Day was updated successfully."
    });
  } else {
    res.send({
      message: `Cannot update Working Day with id=${id}. Maybe Working Day was not found or req.body is empty!`
    });
  }
});

// Delete a Working Day with the specified id in the request
exports.delete = catchAsync(async (req, res) => {
  const id = req.params.id;
  logger.info(`Attempting to delete working day with ID: ${id}`);

  const [num] = await DaysWorking.update({ isDeleted: true }, {
    where: { id: id }
  });

  if (num == 1) {
    logger.info(`Working day deleted successfully with ID: ${id}`);
    res.send({
      message: "Working Day was deleted successfully!"
    });
  } else {
    res.send({
      message: `Cannot delete Working Day with id=${id}. Maybe Working Day was not found!`
    });
  }
});

// Delete all Working Days from the database.
exports.deleteAll = catchAsync(async (req, res) => {
  logger.warn('Attempting to delete all working days.');
  const [nums] = await DaysWorking.update({ isDeleted: true }, {
    where: {},
  });
  logger.info(`${nums} working days were deleted successfully.`);
  res.send({ message: `${nums} Working Days were deleted successfully!` });
});

// Delete all Working Days by Organization Id.
exports.deleteAllByOrgId = catchAsync(async (req, res) => {
    const organizationdId = req.params.id;
    logger.warn(`Attempting to delete all working days for organisation ID: ${organizationdId}`);

    const [nums] = await DaysWorking.update({ isDeleted: true }, {
      where: {organizationId: organizationdId},
    });
    logger.info(`${nums} working days for organisation ID ${organizationdId} were deleted successfully.`);
    res.send({ message: `${nums} Working Days were deleted successfully!` });
});