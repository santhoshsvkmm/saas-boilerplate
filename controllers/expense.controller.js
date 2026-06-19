const db = require("../models");
const Expense = db.expense;
const Department = db.department
const Op = db.Sequelize.Op;
const sequelize = db.sequelize
const catchAsync = require("../utils/catchAsync");
const logger = require('../loggers/logger');

// Create and Save a new Expense
exports.create = catchAsync(async (req, res) => {
  // Validate request
  if (!req.body) {
    return res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  // Create a Expense
  const expense = {
    expenseItemName: req.body.expenseItemName,
    expenseItemStore: req.body.expenseItemStore,
    date: req.body.date,
    amount: req.body.amount,
    departmentId: req.body.departmentId
  };

  // Save Expense in the database
  const data = await Expense.create(expense);
  logger.info(`Expense created successfully with ID: ${data.id}`);
  res.status(201).send(data);
});

// Retrieve all Expenses from the database.
exports.findAll = catchAsync(async (req, res) => {
  logger.info('Retrieving all expenses.');
  const data = await Expense.findAll({
    where: { isDeleted: { [Op.ne]: true } },
    include: [{
      model: Department
    }]
  });
  res.send(data);
});

exports.findAllByYear = catchAsync(async (req, res) => {
  const year = req.params.id;
  logger.info(`Retrieving all expenses for year: ${year}`);
  const data = await Expense.findAll({
    where: {
      [Op.and]: [
        sequelize.where(sequelize.fn('YEAR', sequelize.col('date')), year),
        { isDeleted: { [Op.ne]: true } }
      ]
    },
    attributes: [
      [sequelize.fn('monthname', sequelize.col('date')), 'month'], 
      [sequelize.fn('sum', sequelize.col('amount')), 'expenses']
    ],
    group: [sequelize.fn('month', sequelize.col('date')), 'month']
  });
  res.send(data);
});

exports.findAllByYearAndDept = catchAsync(async (req, res) => {
  const year = req.params.year;
  const deptId = req.params.departmentId;
  logger.info(`Retrieving all expenses for year ${year} and department ID ${deptId}`);
  const data = await Expense.findAll({
    where: {
      [Op.and]: [
        sequelize.where(sequelize.fn('YEAR', sequelize.col('date')), year),
        {departmentId: deptId},
        { isDeleted: { [Op.ne]: true } }
      ]
    },
    attributes: [
      [sequelize.fn('monthname', sequelize.col('date')), 'month'], 
      [sequelize.fn('sum', sequelize.col('amount')), 'expenses']
    ],
    group: [sequelize.fn('month', sequelize.col('date')), 'month']
  });
  res.send(data);
});

//Retrieve all Expenses By Department Id
exports.findAllByDeptId = catchAsync(async (req, res) => {
  const departmentId = req.params.id;
  logger.info(`Retrieving all expenses for department ID: ${departmentId}`);
  const data = await Expense.findAll({ 
    where: { departmentId: departmentId, isDeleted: { [Op.ne]: true } } 
  });
  res.send(data);
});

// Find a single Expense with an id
exports.findOne = catchAsync(async (req, res) => {
  const id = req.params.id;
  logger.info(`Retrieving expense with ID: ${id}`);
  const data = await Expense.findByPk(id);
  res.send(data);
});

// Update an Expense by the id in the request
exports.update = catchAsync(async (req, res) => {
  const id = req.params.id;
  logger.info(`Attempting to update expense with ID: ${id}`);

  const [num] = await Expense.update(req.body, {
    where: { id: id }
  });

  if (num == 1) {
    res.send({
      // message: "Expense was updated successfully."
      message: "Expense was updated successfully."
    });
  } else {
    res.send({
      message: `Cannot update Expense with id=${id}. Maybe Expense was not found or req.body is empty!`
    });
  }
});

// Delete an Expense with the specified id in the request
exports.delete = catchAsync(async (req, res) => {
  const id = req.params.id;
  logger.info(`Attempting to delete expense with ID: ${id}`);

  const [num] = await Expense.update({ isDeleted: true }, {
    where: { id: id }
  });

  if (num == 1) {
    logger.info(`Expense deleted successfully with ID: ${id}`);
    res.send({
      message: "Expense was deleted successfully!"
    });
  } else {
    res.send({
      message: `Cannot delete Expense with id=${id}. Maybe Expense was not found!`
    });
  }
});

// Delete all Expenses from the database.
exports.deleteAll = catchAsync(async (req, res) => {
  logger.warn('Attempting to delete all expenses.');
  const [nums] = await Expense.update({ isDeleted: true }, {
    where: {},
  });
  logger.info(`${nums} expenses were deleted successfully.`);
  res.send({ message: `${nums} Expenses were deleted successfully!` });
});

// Delete all Expenses by Department Id.
exports.deleteAllByDeptId = catchAsync(async (req, res) => {
  const departmentId = req.params.id;
  logger.warn(`Attempting to delete all expenses for department ID: ${departmentId}`);

  const [nums] = await Expense.update({ isDeleted: true }, {
    where: { departmentId: departmentId },
  });
  logger.info(`${nums} expenses for department ID ${departmentId} were deleted successfully.`);
  res.send({ message: `${nums} Expenses were deleted successfully!` });
});