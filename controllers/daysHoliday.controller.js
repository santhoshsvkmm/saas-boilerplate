const db = require("../models");
const DaysHoliday = db.daysHoliday;
const Op = db.Sequelize.Op;
const catchAsync = require("../utils/catchAsync");
const logger = require('../loggers/logger');

// Create and Save a new User
exports.create = catchAsync(async (req, res) => {
  // Validate request
  if (!req.body) {
    return res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  // Create a Holiday Date
  const daysHoliday = {
    date: req.body.date,
    organizationId: req.body.organizationId
  };

  // Save Holiday Date in the database
  const data = await DaysHoliday.create(daysHoliday);
  logger.info(`Holiday created successfully with ID: ${data.id}`);
  res.status(201).send(data);
});

// Retrieve all Departments from the database.
exports.findAll = catchAsync(async (req, res) => {
  logger.info('Retrieving all holidays.');
  const data = await DaysHoliday.findAll({
    where: { isDeleted: { [Op.ne]: true } }
  });
  res.send(data);
});

// Find a single Holiday Date with an id
exports.findOne = catchAsync(async (req, res) => {
  const id = req.params.id;
  logger.info(`Retrieving holiday with ID: ${id}`);
  const data = await DaysHoliday.findByPk(id);
  res.send(data);
});

// Update a Holiday Date by the id in the request
exports.update = catchAsync(async (req, res) => {
  const id = req.params.id;
  logger.info(`Attempting to update holiday with ID: ${id}`);

  const [num] = await DaysHoliday.update(req.body, {
    where: { id: id }
  });

  if (num == 1) {
    logger.info(`Holiday updated successfully with ID: ${id}`);
    res.send({
      message: "Holiday Date was updated successfully."
    });
  } else {
    res.send({
      message: `Cannot update Holiday Date with id=${id}. Maybe Holiday Date was not found or req.body is empty!`
    });
  }
});

// Delete a Holiday Day with the specified id in the request
exports.delete = catchAsync(async (req, res) => {
  const id = req.params.id;
  logger.info(`Attempting to delete holiday with ID: ${id}`);

  const [num] = await DaysHoliday.update({ isDeleted: true }, {
    where: { id: id }
  });

  if (num == 1) {
    logger.info(`Holiday deleted successfully with ID: ${id}`);
    res.send({
      message: "Holiday Date was deleted successfully!"
    });
  } else {
    res.send({
      message: `Cannot delete Holiday Date with id=${id}. Maybe Holiday Date was not found!`
    });
  }
});

// Delete all Departments from the database.
exports.deleteAll = catchAsync(async (req, res) => {
  logger.warn('Attempting to delete all holidays.');
  const [nums] = await DaysHoliday.update({ isDeleted: true }, {
    where: {},
  });
  logger.info(`${nums} holidays were deleted successfully.`);
  res.send({ message: `${nums} Holiday Dates were deleted successfully!` });
});