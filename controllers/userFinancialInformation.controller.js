const db = require("../models");
const UserFinancialInformation = db.userFinancialInfo;
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

  // Create an UserFinancialInformation
  const userFinancialInformation = {
    employmentType: req.body.employmentType,
    salaryBasic: req.body.salaryBasic ,
    salaryGross: req.body.salaryGross,
    salaryNet: req.body.salaryNet,
    allowanceHouseRent: req.body.allowanceHouseRent,
    allowanceMedical: req.body.allowanceMedical,
    allowanceSpecial: req.body.allowanceSpecial,
    allowanceFuel: req.body.allowanceFuel,
    allowancePhoneBill: req.body.allowancePhoneBill,
    allowanceOther: req.body.allowanceOther,
    allowanceTotal: req.body.allowanceTotal,
    bankName: req.body.bankName,
    accountName: req.body.accountName,
    accountNumber: req.body.accountNumber,
    iban: req.body.iban,
    userId: req.body.userId
  };

  // Save UserFinancialInformation in the database
  const existingInfo = await UserFinancialInformation.findOne({
    where: {userId: userFinancialInformation.userId}
  });

  if(existingInfo) {
    logger.warn(`Financial information creation failed for user ID ${userFinancialInformation.userId}: already exists.`);
    return res.status(403).send({message: "Financial Information Already Exists for this User"});
  }

  const data = await UserFinancialInformation.create(userFinancialInformation);
  logger.info(`Financial information created successfully for user ID: ${data.userId}`);
  res.status(201).send(data);
});

// Retrieve all User Financial Informations from the database.
exports.findAll = catchAsync(async (req, res) => {
  logger.info('Retrieving all user financial informations.');
  const data = await UserFinancialInformation.findAll({
    where: { isDeleted: { [Op.ne]: true } },
    include: [{model: db.user, as: db.user.tablename}]});
  res.send(data);
});

//Retrieve all User Financial Informations By User Id
exports.findByUserId = catchAsync(async (req, res) => {
  const userId = req.params.id;
  logger.info(`Retrieving financial information for user ID: ${userId}`);
  const data = await UserFinancialInformation.findAll({ 
    where: { userId: userId, isDeleted: { [Op.ne]: true } } 
  });
  res.send(data);
});

// Find a single UserFinancialInformation with an id
exports.findOne = catchAsync(async (req, res) => {
  const id = req.params.id;
  logger.info(`Retrieving financial information with ID: ${id}`);
  const data = await UserFinancialInformation.findByPk(id, {include: [{model: db.user, as: db.user.tablename}]});
  res.send(data);
});

// Update an UserFinancialInformation by the id in the request
exports.update = catchAsync(async (req, res) => {
  const id = req.params.id;
  logger.info(`Attempting to update financial information with ID: ${id}`);

  const [num] = await UserFinancialInformation.update(req.body, {
    where: { id: id }
  });

  if (num == 1) {
    logger.info(`Financial information updated successfully with ID: ${id}`);
    res.send({
      message: "UserFinancialInformation was updated successfully."
    });
  } else {
    res.send({
      message: `Cannot update UserFinancialInformation with id=${id}. Maybe UserFinancialInformation was not found or req.body is empty!`
    });
  }
});

// Delete an UserFinancialInformation with the specified id in the request
exports.delete = catchAsync(async (req, res) => {
  const id = req.params.id;
  logger.info(`Attempting to delete financial information with ID: ${id}`);

  const [num] = await UserFinancialInformation.update({ isDeleted: true }, {
    where: { id: id }
  });

  if (num == 1) {
    logger.info(`Financial information deleted successfully with ID: ${id}`);
    res.send({
      message: "UserFinancialInformation was deleted successfully!"
    });
  } else {
    res.send({
      message: `Cannot delete UserFinancialInformation with id=${id}. Maybe UserFinancialInformation was not found!`
    });
  }
});

// Delete all User Financial Informations from the database.
exports.deleteAll = catchAsync(async (req, res) => {
  logger.warn('Attempting to delete all user financial informations.');
  const [nums] = await UserFinancialInformation.update({ isDeleted: true }, {
    where: {},
  });
  logger.info(`${nums} user financial informations were deleted successfully.`);
  res.send({ message: `${nums} User Financial Informations were deleted successfully!` });
});