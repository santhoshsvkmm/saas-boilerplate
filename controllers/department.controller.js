const db = require("../models");
const Department = db.department;
const User = db.user;
const Job = db.job;
const Op = db.Sequelize.Op;
const catchAsync = require("../utils/catchAsync");

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
  res.status(201).send(data);
});

// Retrieve all Departments from the database.
exports.findAll = catchAsync(async (req, res) => {
  const data = await Department.findAll({
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

  const [num] = await Department.update(req.body, {
    where: { id: id }
  });

  if (num == 1) {
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

  // The onDelete: 'SET NULL' hook in the model association will automatically
  // handle setting the departmentId to null for associated users.
  const num = await Department.destroy({
    where: { id: id }
  });

  if (num == 1) {
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
  const nums = await Department.destroy({
    where: {},
    truncate: false
  });
  res.send({ message: `${nums} Departments were deleted successfully!` });
});