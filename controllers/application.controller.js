const db = require("../models");
const Application = db.application;
const User = db.user;
const Department = db.department
const Op = db.Sequelize.Op;
const moment = require('moment');
const { department } = require("../models");
const catchAsync = require("../utils/catchAsync");

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
  res.send(data);
});

// Retrieve all Applications from the database.
exports.findAll = catchAsync(async (req, res) => {
  const data = await Application.findAll({
    include: User
  });
  res.send(data);
});

// Retrieve all Applications from the database.
exports.findAllRecent = catchAsync(async (req, res) => {
  const data = await Application.findAll({
    where: {
      [Op.and]: [
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

  const data = await Application.findAll({
    where: {
      [Op.and]: [
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

  const data = await Application.findAll({
    where: {
      [Op.and]: [
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

  const data = await Application.findAll({
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

  if (loggedInUserId.toString() !== userId && req.authData.user.role !== 'ROLE_ADMIN' && req.authData.user.role !== 'ROLE_MANAGER') {
    return res.status(403).send({ message: "Access denied: You are not authorized to view these applications." });
  }

  await User.findByPk(userId);
  const data = await Application.findAll({ 
    include: [{
      model: User
    }],
    where: { userId: userId } 
  });
  res.send(data);
});

// Find a single Application with an id
exports.findOne = catchAsync(async (req, res) => {
  const id = req.params.id;

  const data = await Application.findByPk(id);
  res.send(data);
});

// Update a Application by the id in the request
exports.update = catchAsync(async (req, res) => {
  const id = req.params.id;

  const [num] = await Application.update(req.body, {
    where: { id: id },
  });

  if (num == 1) {
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

  const num = await Application.destroy({
    where: { id: id },
  });

  if (num == 1) {
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
  const nums = await Application.destroy({
    where: {},
    truncate: false,
  });
  res.send({ message: `${nums} Applications were deleted successfully!` });
});

// Delete all Applications by User Id.
exports.deleteAllByUserId = catchAsync(async (req, res) => {
  const userId = req.params.id;

  const nums = await Application.destroy({
    where: { userId: userId },
    truncate: false,
  });
  res.send({ message: `${nums} Applications were deleted successfully!` });
});
