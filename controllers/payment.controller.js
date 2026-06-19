const db = require("../models");
const { user } = require("../models");
const Payment = db.payment;
const User = db.user
const Job = db.job
const UserFinancialInfo = db.userFinancialInfo
const Op = db.Sequelize.Op;
const sequelize = db.sequelize
const catchAsync = require("../utils/catchAsync");
const logger = require('../loggers/logger');

// Create and Save a new Payment
exports.create = catchAsync(async (req, res) => {
  // Validate request
  if (!req.body) {
    return res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  // Create a Payment
  const payment = {
    paymentType: req.body.paymentType,
    paymentMonth: req.body.paymentMonth,
    paymentDate: req.body.paymentDate,
    paymentFine: req.body.paymentFine,
    paymentAmount: req.body.paymentAmount,
    comments: req.body.comments,
    jobId: req.body.jobId
  };

  // Save Payment in the database
  const data = await Payment.create(payment);
  logger.info(`Payment created successfully with ID: ${data.id}`);
  res.status(201).send(data);
});

// Retrieve all Payments from the database.
exports.findAll = catchAsync(async (req, res) => {
  logger.info('Retrieving all payments.');
  const data = await Payment.findAll({
    where: { isDeleted: { [Op.ne]: true } }
  });
  res.send(data);
});

exports.findAllByYear = catchAsync(async (req, res) => {
  const year = req.params.id;
  logger.info(`Retrieving all payments for year: ${year}`);
  const data = await Payment.findAll({
    where: {
      [Op.and]: [
        sequelize.where(sequelize.fn('YEAR', sequelize.col('payment_month')), year),
        { isDeleted: { [Op.ne]: true } }
      ]
    },
    attributes: [
      [sequelize.fn('monthname', sequelize.col('payment_month')), 'month'], 
      [sequelize.fn('sum', sequelize.col('payment_amount')), 'expenses']
    ],
    group: [sequelize.fn('month', sequelize.col('payment_month')), 'month']
  });
  res.send(data);
});

//Retrieve all Payments By Organization Id
exports.findAllByJobId = catchAsync(async (req, res) => {
  const jobId = req.params.id;
  logger.info(`Retrieving all payments for job ID: ${jobId}`);
  const data = await Payment.findAll({ 
    where: { jobId: jobId, isDeleted: { [Op.ne]: true } } 
  });
  res.send(data);
});

// Find a single Payment with an id
exports.findOne = catchAsync(async (req, res) => {
  const id = req.params.id;
  logger.info(`Retrieving payment with ID: ${id}`);
  const data = await Payment.findByPk(id);
  res.send(data);
});

exports.findAllByUser = catchAsync(async (req, res) => {
  const id = req.params.id
  logger.info(`Retrieving all payments for user ID: ${id}`);
  const data = await Payment.findAll({
    where: { isDeleted: { [Op.ne]: true } },
    include: [{
      model: Job,
      where: {userId: id},
      include: [{
        model: User,
        include: [{
          model: UserFinancialInfo
        }]
      }]
    }]
  })
  res.send(data);
});

// Update an Payment by the id in the request
exports.update = catchAsync(async (req, res) => {
  const id = req.params.id;
  logger.info(`Attempting to update payment with ID: ${id}`);
  const [num] = await Payment.update(req.body, {
    where: { id: id }
  });

  if (num == 1) {
    logger.info(`Payment updated successfully with ID: ${id}`);
    res.send({
      message: "Payment was updated successfully."
    });
  } else {
    res.send({
      message: `Cannot update Payment with id=${id}. Maybe Payment was not found or req.body is empty!`
    });
  }
});

// Delete an Payment with the specified id in the request
exports.delete = catchAsync(async (req, res) => {
  const id = req.params.id;
  logger.info(`Attempting to delete payment with ID: ${id}`);
  const [num] = await Payment.update({ isDeleted: true }, {
    where: { id: id }
  });

  if (num == 1) {
    logger.info(`Payment deleted successfully with ID: ${id}`);
    res.send({
      message: "Payment was deleted successfully!"
    });
  } else {
    res.send({
      message: `Cannot delete Payment with id=${id}. Maybe Payment was not found!`
    });
  }
});

// Delete all Payments from the database.
exports.deleteAll = catchAsync(async (req, res) => {
  logger.warn('Attempting to delete all payments.');
  const [nums] = await Payment.update({ isDeleted: true }, {
    where: {},
  });
  logger.info(`${nums} payments were deleted successfully.`);
  res.send({ message: `${nums} Payments were deleted successfully!` });
});

// Delete all Payments by Job Id.
exports.deleteAllByJobId = catchAsync(async (req, res) => {
    const jobId = req.params.id;
    logger.warn(`Attempting to delete all payments for job ID: ${jobId}`);
    const [nums] = await Payment.update({ isDeleted: true }, {
      where: {jobId: jobId},
    });
    logger.info(`${nums} payments for job ID ${jobId} were deleted successfully.`);
    res.send({ message: `${nums} Payments were deleted successfully!` });
});