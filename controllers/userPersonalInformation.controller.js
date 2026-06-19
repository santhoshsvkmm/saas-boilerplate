const db = require("../models");
const UserPersonalInformation = db.userPersonalInfo;
const Op = db.Sequelize.Op;
const moment = require('moment')
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

  // Create an UserPersonalInformation
  const userPersonalInformation = {
    dateOfBirth: moment(req.body.dateOfBirth).format('YYYY-MM-DD'),
    gender: req.body.gender,
    maritalStatus: req.body.maritalStatus,
    fatherName: req.body.fatherName,
    idNumber: req.body.idNumber,
    address: req.body.address,
    city: req.body.city,
    country: req.body.country,
    mobile: req.body.mobile,
    phone: req.body.phone,
    emailAddress: req.body.emailAddress,
    userId: req.body.userId
  };

  // Save UserPersonalInformation in the database
  const existingInfo = await UserPersonalInformation.findOne({
    where: {userId: userPersonalInformation.userId}
  });

  if (existingInfo) {
    logger.warn(`Personal information creation failed for user ID ${userPersonalInformation.userId}: already exists.`);
    return res.status(403).send({message: "Personal Information already exists for this User"});
  }

  const data = await UserPersonalInformation.create(userPersonalInformation);
  logger.info(`Personal information created successfully for user ID: ${data.userId}`);
  res.status(201).send(data);
});

// Retrieve all User Personal Informations from the database.
exports.findAll = catchAsync(async (req, res) => {
  logger.info('Retrieving all user personal informations.');
  const data = await UserPersonalInformation.findAll({
    where: { isDeleted: { [Op.ne]: true } },
    include: [{model: db.user, as: db.user.tablename}]});
  res.send(data);
});

//Retrieve all User Personal Informations By User Id
exports.findAllByUserId = catchAsync(async (req, res) => {
  const userId = req.params.id;
  logger.info(`Retrieving personal information for user ID: ${userId}`);
  const data = await UserPersonalInformation.findOne({
    where: {userId: userId, isDeleted: { [Op.ne]: true }}
  });
  res.send(data);
});

// Find a single UserPersonalInformation with an id
exports.findOne = catchAsync(async (req, res) => {
  const id = req.params.id;
  logger.info(`Retrieving personal information with ID: ${id}`);
  const data = await UserPersonalInformation.findByPk(id, {include: [{model: db.user, as: db.user.tablename}]});
  res.send(data);
});

// Update an UserPersonalInformation by the id in the request
exports.update = catchAsync(async (req, res) => {
  const id = req.params.id;
  logger.info(`Attempting to update personal information with ID: ${id}`);

  const [num] = await UserPersonalInformation.update(req.body, {
    where: { id: id }
  });

  if (num == 1) {
    logger.info(`Personal information updated successfully with ID: ${id}`);
    res.send({
      message: "UserPersonalInformation was updated successfully."
    });
  } else {
    res.send({
      message: `Cannot update UserPersonalInformation with id=${id}. Maybe UserPersonalInformation was not found or req.body is empty!`
    });
  }
});

// Delete an UserPersonalInformation with the specified id in the request
exports.delete = catchAsync(async (req, res) => {
  const id = req.params.id;
  logger.info(`Attempting to delete personal information with ID: ${id}`);

  const [num] = await UserPersonalInformation.update({ isDeleted: true }, {
    where: { id: id }
  });

  if (num == 1) {
    logger.info(`Personal information deleted successfully with ID: ${id}`);
    res.send({
      message: "UserPersonalInformation was deleted successfully!"
    });
  } else {
    res.send({
      message: `Cannot delete UserPersonalInformation with id=${id}. Maybe UserPersonalInformation was not found!`
    });
  }
});

// Delete all User Personal Informations from the database.
exports.deleteAll = catchAsync(async (req, res) => {
  logger.warn('Attempting to delete all user personal informations.');
  const [nums] = await UserPersonalInformation.update({ isDeleted: true }, {
    where: {},
  });
  logger.info(`${nums} user personal informations were deleted successfully.`);
  res.send({ message: `${nums} User Personal Informations were deleted successfully!` });
});