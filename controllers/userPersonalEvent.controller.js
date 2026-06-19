const db = require("../models");
const PersonalEvent = db.userPersonalEvent;
const Op = db.Sequelize.Op;
const catchAsync = require("../utils/catchAsync");
const logger = require('../loggers/logger');

// Create and Save a new PersonalEvent
exports.create = catchAsync(async (req, res) => {
    // Validate request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  // Create a PersonalEvent
  const personalEvent = {
    eventTitle: req.body.eventTitle,
    eventDescription: req.body.eventDescription,
    eventStartDate: req.body.eventStartDate,
    eventEndDate: req.body.eventEndDate,
    userId: req.body.userId
  };

  // Save PersonalEvent in the database
  const data = await PersonalEvent.create(personalEvent);
  logger.info(`Personal event created successfully with ID: ${data.id} for user ID: ${data.userId}`);
  res.send(data);
});

// Retrieve all Personal Events from the database.
exports.findAll = catchAsync(async (req, res) => {
  logger.info('Retrieving all personal events.');
  const data = await PersonalEvent.findAll({
    where: { isDeleted: { [Op.ne]: true } }
  });
  res.send(data);
});

//Retrieve all Personal Events By User Id
exports.findAllByUserId = catchAsync(async (req, res) => {
    const userId = req.params.id;
    const loggedInUserId = req.authData.user.id;

    if (loggedInUserId.toString() !== userId && req.authData.user.role !== 'ROLE_ADMIN') {
      return res.status(403).send({ message: "Access denied." });
    }

    logger.info(`Retrieving all personal events for user ID: ${userId}`);
    const data = await PersonalEvent.findAll({
      where: {userId: userId, isDeleted: { [Op.ne]: true }}
    });
    res.send(data);
});

// Find a single PersonalEvent with an id
exports.findOne = catchAsync(async (req, res) => {
  const id = req.params.id;
  logger.info(`Retrieving personal event with ID: ${id}`);

  const data = await PersonalEvent.findByPk(id);
  res.send(data);
});

// Update an PersonalEvent by the id in the request
exports.update = catchAsync(async (req, res) => {
  const id = req.params.id;
  logger.info(`Attempting to update personal event with ID: ${id}`);

  const [num] = await PersonalEvent.update(req.body, {
    where: { id: id }
  });

  if (num == 1) {
    logger.info(`Personal event updated successfully with ID: ${id}`);
    res.send({
      message: "PersonalEvent was updated successfully."
    });
  } else {
    res.send({
      message: `Cannot update PersonalEvent with id=${id}. Maybe PersonalEvent was not found or req.body is empty!`
    });
  }
});

// Delete an PersonalEvent with the specified id in the request
exports.delete = catchAsync(async (req, res) => {
  const id = req.params.id;
  logger.info(`Attempting to delete personal event with ID: ${id}`);

  const [num] = await PersonalEvent.update({ isDeleted: true }, {
    where: { id: id }
  });

  if (num == 1) {
    logger.info(`Personal event deleted successfully with ID: ${id}`);
    res.send({
      message: "PersonalEvent was deleted successfully!"
    });
  } else {
    res.send({
      message: `Cannot delete PersonalEvent with id=${id}. Maybe Tutorial was not found!`
    });
  }
});

// Delete all Personal Events from the database.
exports.deleteAll = catchAsync(async (req, res) => {
  logger.warn('Attempting to delete all personal events.');
  const [nums] = await PersonalEvent.update({ isDeleted: true }, {
    where: {},
  });
  logger.info(`${nums} personal events were deleted successfully.`);
  res.send({ message: `${nums} Personal Events were deleted successfully!` });
});

// Delete all Personal Events by User Id.
exports.deleteAllByUserId = catchAsync(async (req, res) => {
    const userId = req.params.id;
    logger.warn(`Attempting to delete all personal events for user ID: ${userId}`);

    const [nums] = await PersonalEvent.update({ isDeleted: true }, {
      where: {userId: userId},
    });
    logger.info(`${nums} personal events for user ID ${userId} were deleted successfully.`);
    res.send({ message: `${nums} Personal Events were deleted successfully!` });
});