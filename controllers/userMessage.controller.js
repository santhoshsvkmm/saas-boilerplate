const db = require("../models");
const Message = db.userMessage;
const Op = db.Sequelize.Op;
const catchAsync = require("../utils/catchAsync");
const logger = require('../loggers/logger');

// Create and Save a new Message
exports.create = catchAsync(async (req, res) => {
  // Validate request
  if (!req.body) {
    return res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  // Create a Message
  const message = {
    text: req.body.text,
    receiver: req.body.receiver,
    sender: req.body.sender
  };

  // Save Message in the database
  const data = await Message.create(message);
  logger.info(`Message created successfully with ID: ${data.id}`);
  res.status(201).send(data);
});

// Retrieve all Messages from the database.
exports.findAll = catchAsync(async (req, res) => {
  logger.info('Retrieving all messages.');
  const data = await Message.findAll({
    where: { isDeleted: { [Op.ne]: true } }
  });
  res.send(data);
});

//Retrieve all Messages By User Id
exports.findAllByUserId = catchAsync(async (req, res) => {
  const userId = req.params.id;
  logger.info(`Retrieving all messages for sender ID: ${userId}`);
  const data = await Message.findAll({ 
    where: { senderId: userId, isDeleted: { [Op.ne]: true } } 
  });
  res.send(data);
});

// Find a single Message with an id
exports.findOne = catchAsync(async (req, res) => {
  const id = req.params.id;
  logger.info(`Retrieving message with ID: ${id}`);
  const data = await Message.findByPk(id);
  res.send(data);
});

// Update an Message by the id in the request
exports.update = catchAsync(async (req, res) => {
  const id = req.params.id;
  logger.info(`Attempting to update message with ID: ${id}`);

  const [num] = await Message.update(req.body, {
    where: { id: id }
  });

  if (num == 1) {
    logger.info(`Message updated successfully with ID: ${id}`);
    res.send({
      message: "Message was updated successfully."
    });
  } else {
    res.send({
      message: `Cannot update Message with id=${id}. Maybe Message was not found or req.body is empty!`
    });
  }
});

// Delete an Message with the specified id in the request
exports.delete = catchAsync(async (req, res) => {
  const id = req.params.id;
  logger.info(`Attempting to delete message with ID: ${id}`);

  const [num] = await Message.update({ isDeleted: true }, {
    where: { id: id }
  });

  if (num == 1) {
    logger.info(`Message deleted successfully with ID: ${id}`);
    res.send({
      message: "Message was deleted successfully!"
    });
  } else {
    res.send({
      message: `Cannot delete Message with id=${id}. Maybe Message was not found!`
    });
  }
});

// Delete all Messages from the database.
exports.deleteAll = catchAsync(async (req, res) => {
  logger.warn('Attempting to delete all messages.');
  const [nums] = await Message.update({ isDeleted: true }, {
    where: {},
  });
  logger.info(`${nums} messages were deleted successfully.`);
  res.send({ message: `${nums} Messages were deleted successfully!` });
});

// Delete all Messages by User Id.
exports.deleteAllByUserId = catchAsync(async (req, res) => {
    const organizationdId = req.params.id;
    logger.warn(`Attempting to delete all messages for organisation ID: ${organizationdId}`);

    const [nums] = await Message.update({ isDeleted: true }, {
      where: {organizationId: organizationdId},
    });
    logger.info(`${nums} messages for organisation ID ${organizationdId} were deleted successfully.`);
    res.send({ message: `${nums} Messages were deleted successfully!` });
});