const db = require("../models");
const Application = db.application;
const User = db.user;
const Department = db.department
const Op = db.Sequelize.Op;
const moment = require('moment');
const { department } = require("../models");
const catchAsync = require("../utils/catchAsync");
const logger = require('../loggers/logger');
const { clearCacheByTag } = require('../utils/cache.util');

// Create and Save a new Application
exports.create = catchAsync(async (req, res) => {
    // Validate request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
    return;
  }

  // Create a Application
  const application = {
    reason: req.body.reason,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
    status: "pending",
    type: req.body.type,
    userId: req.body.userId,
  };

  // Save Application in the database

  const data = await Application.create(application);
  logger.info(`Application created successfully with ID: ${data.id} for user ID: ${data.userId}`);
  await clearCacheByTag('applications');
  res.status(201).send(data);
});

// Retrieve all Applications from the database.
exports.findAll = catchAsync(async (req, res) => {
  logger.info('Retrieving all applications.');
  const data = await Application.findAll({
    where: { isDeleted: { [Op.ne]: true } },
    include: User
  });
  res.send(data);
});

// Retrieve all Applications from the database.
exports.findAllRecent = catchAsync(async (req, res) => {
  logger.info('Retrieving all recent applications.');
  const data = await Application.findAll({
    where: {
      [Op.and]: [
        { isDeleted: { [Op.ne]: true } },
        {startDate: {
          [Op.gte]: moment().subtract(14, 'days').toDate()
        }},
        {startDate : {
          [Op.lte]: moment().add(7, 'days').toDate()
        }}
      ]
    },
    include: [{
      model: User
    }]
  });
  res.send(data);
});

exports.findAllRecentAndDept = catchAsync(async (req, res) => {
  const id = req.params.id
  logger.info(`Retrieving all recent applications for department ID: ${id}`);
  const data = await Application.findAll({
    where: {
      [Op.and]: [
        { isDeleted: { [Op.ne]: true } },
        {startDate: {
          [Op.gte]: moment().subtract(14, 'days').toDate()
        }},
        {startDate : {
          [Op.lte]: moment().add(7, 'days').toDate()
        }}
      ]
    },
    include: [{
      model: User,
      where: {departmentId: id}
    }]
  });
  res.send(data);
});

exports.findAllRecentAndUser = catchAsync(async (req, res) => {
  const id = req.params.id
  logger.info(`Retrieving all recent applications for user ID: ${id}`);
  const data = await Application.findAll({
    where: {
      [Op.and]: [
        { isDeleted: { [Op.ne]: true } },
        {startDate: {
          [Op.gte]: moment().subtract(14, 'days').toDate()
        }},
        {startDate : {
          [Op.lte]: moment().add(7, 'days').toDate()
        }}
      ]
    },
    include: [{
      model: User,
      where: {id: id}
    }]
  });
  res.send(data);
});

//Retrieve all Applications By User Id
exports.findAllByDeptId = catchAsync(async (req, res) => {
  const deptId = req.params.id;
  logger.info(`Retrieving all applications for department ID: ${deptId}`);
  const data = await Application.findAll({
    where: { isDeleted: { [Op.ne]: true } },
    include: [{
      model: User,
      where: {departmentId: deptId}
    }]
  });
  res.send(data);
});

//Retrieve all Applications By User Id
exports.findAllByUserId = catchAsync(async (req, res) => {
  const userId = req.params.id;
  const loggedInUserId = req.authData.user.id;
  logger.info(`Retrieving all applications for user ID: ${userId}`);

  if (loggedInUserId.toString() !== userId && req.authData.user.role !== 'ROLE_ADMIN' && req.authData.user.role !== 'ROLE_MANAGER') {
    return res.status(403).send({ message: "Access denied: You are not authorized to view these applications." });
  }

  await User.findByPk(userId);
  const data = await Application.findAll({ 
    include: [{
      model: User
    }],
    where: { userId: userId, isDeleted: { [Op.ne]: true } } 
  });
  res.send(data);
});

// Find a single Application with an id
exports.findOne = catchAsync(async (req, res) => {
  const id = req.params.id;
  logger.info(`Retrieving application with ID: ${id}`);
  const data = await Application.findByPk(id);
  res.send(data);
});

// Update a Application by the id in the request
exports.update = catchAsync(async (req, res) => {
  const id = req.params.id;
  logger.info(`Attempting to update application with ID: ${id}`);

  const [num] = await Application.update(req.body, {
    where: { id: id },
  });

  if (num == 1) {
    logger.info(`Application updated successfully with ID: ${id}`);
    await clearCacheByTag('applications');
    res.send({
      message: "Application was updated successfully.",
    });
  } else {
    res.send({
      message: `Cannot update Application with id=${id}. Maybe Application was not found or req.body is empty!`,
    });
  }
});

// Delete a Application with the specified id in the request
exports.delete = catchAsync(async (req, res) => {
  const id = req.params.id;
  logger.info(`Attempting to delete application with ID: ${id}`);

  const [num] = await Application.update({ isDeleted: true }, {
    where: { id: id },
  });

  if (num == 1) {
    logger.info(`Application deleted successfully with ID: ${id}`);
    await clearCacheByTag('applications');
    res.send({
      message: "Application was deleted successfully!",
    });
  } else {
    res.send({
      message: `Cannot delete Application with id=${id}. Maybe Tutorial was not found!`,
    });
  }
});

// Delete all Applications from the database.
exports.deleteAll = catchAsync(async (req, res) => {
  logger.warn('Attempting to delete all applications.');
  const [nums] = await Application.update({ isDeleted: true }, {
    where: {},
  });
  await clearCacheByTag('applications');
  logger.info(`${nums} applications were deleted successfully.`);
  res.send({ message: `${nums} Applications were deleted successfully!` });
});

// Delete all Applications by User Id.
exports.deleteAllByUserId = catchAsync(async (req, res) => {
  const userId = req.params.id;
  logger.warn(`Attempting to delete all applications for user ID: ${userId}`);

  const [nums] = await Application.update({ isDeleted: true }, {
    where: { userId: userId },
  });
  await clearCacheByTag('applications');
  logger.info(`${nums} applications for user ID ${userId} were deleted successfully.`);
  res.send({ message: `${nums} Applications were deleted successfully!` });
});
