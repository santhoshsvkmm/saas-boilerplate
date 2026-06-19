const db = require("../models");
const Department = db.department;
const User = db.user;
const Job = db.job;
const Op = db.Sequelize.Op;
const catchAsync = require("../utils/catchAsync");
const logger = require('../loggers/logger');

// Create and Save a new Department
exports.create = catchAsync(async (req, res) => {
  // Validate request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  // Create a Department
  const department = {
    departmentName: req.body.departmentName,
    organizationId: req.body.organizationId
  };

  // Save Department in the database
  const data = await Department.create(department);
  logger.info(`Department created successfully with ID: ${data.id}`);
  res.status(201).send(data);
});

// Retrieve all Departments from the database.
exports.findAll = catchAsync(async (req, res) => {
  logger.info('Retrieving all departments.');
  const data = await Department.findAll({
    where: { isDeleted: { [Op.ne]: true } },
    include: [{
      model: User,
      include: {
        model: Job,
        include: {
          model: User
        }
      }
    }]
  });
  res.send(data);
});

// Find a single Department with an id
exports.findOne = catchAsync(async (req, res) => {
  const id = req.params.id;
  logger.info(`Retrieving department with ID: ${id}`);

  const data = await Department.findByPk(id, {
    include: [{
      model: User,
      include: {
        model: Job,
        include: {
          model: User
        }
      }
    }]
  });
  res.send(data);
});

// Update a Department by the id in the request
exports.update = catchAsync(async (req, res) => {
  const id = req.params.id;
  logger.info(`Attempting to update department with ID: ${id}`);

  const [num] = await Department.update(req.body, {
    where: { id: id }
  });

  if (num == 1) {
    logger.info(`Department updated successfully with ID: ${id}`);
    res.send({
      message: "Department was updated successfully."
    });
  } else {
    res.send({
      message: `Cannot update Department with id=${id}. Maybe Department was not found or req.body is empty!`
    });
  }
});

// Delete an Department with the specified id in the request
exports.delete = catchAsync(async (req, res) => {
  const id = req.params.id;
  logger.info(`Attempting to delete department with ID: ${id}`);

  // The onDelete: 'SET NULL' hook in the model association will automatically
  // handle setting the departmentId to null for associated users.
  const [num] = await Department.update({ isDeleted: true }, {
    where: { id: id }
  });

  if (num == 1) {
    logger.info(`Department deleted successfully with ID: ${id}`);
    res.send({
      message: "Department was deleted successfully!"
    });
  } else {
    res.send({
      message: `Cannot delete Department with id=${id}. Maybe Department was not found!`
    });
  }
});

// Delete all Departments from the database.
exports.deleteAll = catchAsync(async (req, res) => {
  logger.warn('Attempting to delete all departments.');
  const [nums] = await Department.update({ isDeleted: true }, {
    where: {},
  });
  res.send({ message: `${nums} Departments were deleted successfully!` });
  logger.info(`${nums} departments were deleted successfully.`);
});