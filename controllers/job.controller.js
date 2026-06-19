const db = require("../models");
const Job = db.job;
const Op = db.Sequelize.Op;
const moment = require('moment');
const catchAsync = require("../utils/catchAsync");
const logger = require('../loggers/logger');

// Create and Save a new User
exports.create = catchAsync(async (req, res) => {
  // Validate request
  if (!req.body) {
    return res.status(400).send({
      message: "Content can not be empty!",
    });
  }

  // Create a Job
  const newJob = {
    jobTitle: req.body.jobTitle,
    startDate: moment(req.body.startDate).format('YYYY-MM-DD HH:mm:ss'),
    endDate: moment(req.body.endDate).format('YYYY-MM-DD HH:mm:ss'),
    userId: req.body.userId,
  };

  const existingJob = await Job.findOne({
    where: {
      [Op.and]: [
        { userId: req.body.userId },
        {startDate: {[Op.lte]: Date.now()}},
        {endDate: 
          {
            [Op.or]: [
              {[Op.gte]: Date.now()},
              {[Op.is]: null}
            ]
          }
        }
      ]
    }
  });

  if (existingJob) {
    if(new Date(existingJob.endDate) > new Date(newJob.startDate)) {
      existingJob.endDate = moment(newJob.startDate).subtract(1, "days");
    }
    await existingJob.save();
  }

  const data = await Job.create(newJob);
  logger.info(`Job created successfully with ID: ${data.id} for user ID: ${data.userId}`);
  res.status(201).send(data);
});

// Retrieve all Jobs from the database.
exports.findAll = catchAsync(async (req, res) => {
  logger.info('Retrieving all jobs.');
  const data = await Job.findAll({
    where: { isDeleted: { [Op.ne]: true } }
  });
  res.send(data);
});

//Retrieve all Jobs By User Id
exports.findAllByUserId = catchAsync(async (req, res) => {
  const userId = req.params.id;
  logger.info(`Retrieving all jobs for user ID: ${userId}`);
  const data = await Job.findAll({ 
    where: { userId: userId, isDeleted: { [Op.ne]: true } } 
  });
  res.send(data);
});

// Find a single Job with an id
exports.findOne = catchAsync(async (req, res) => {
  const id = req.params.id;
  logger.info(`Retrieving job with ID: ${id}`);
  const data = await Job.findOne({
    where: { id: id, isDeleted: { [Op.ne]: true } }
  });
  res.send(data);
});

// Update an Job by the id in the request
exports.update = catchAsync(async (req, res) => {
  const id = req.params.id;

  const [num] = await Job.update(req.body, {
    where: { id: id },
  });

  if (num == 1) {
    res.send({
      message: "Job was updated successfully.",
    });
  } else {
    res.send({
      message: `Cannot update Job with id=${id}. Maybe Job was not found or req.body is empty!`,
    });
  }
});

// Delete an Job with the specified id in the request
exports.delete = catchAsync(async (req, res) => {
  const id = req.params.id;
  logger.info(`Attempting to delete job with ID: ${id}`);

  const [num] = await Job.update({ isDeleted: true }, {
    where: { id: id },
  });

  if (num == 1) {
    logger.info(`Job deleted successfully with ID: ${id}`);
    res.send({
      message: "Job was deleted successfully!",
    });
  } else {
    res.send({
      message: `Cannot delete Job with id=${id}. Maybe Job was not found!`,
    });
  }
});

// Delete all Jobs from the database.
exports.deleteAll = catchAsync(async (req, res) => {
  logger.warn('Attempting to delete all jobs.');
  const [nums] = await Job.update({ isDeleted: true }, {
    where: {},
  });
  logger.info(`${nums} jobs were deleted successfully.`);
  res.send({ message: `${nums} Jobs were deleted successfully!` });
});

// Delete all Jobs by User Id.
exports.deleteAllByUserId = catchAsync(async (req, res) => {
  const userId = req.params.id;
  logger.warn(`Attempting to delete all jobs for user ID: ${userId}`);

  const [nums] = await Job.update({ isDeleted: true }, {
    where: { userId: userId },
  });
  logger.info(`${nums} jobs for user ID ${userId} were deleted successfully.`);
  res.send({ message: `${nums} Jobs were deleted successfully!` });
});
