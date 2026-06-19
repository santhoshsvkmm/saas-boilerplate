const db = require("../models");
const DepartmentAnnouncement = db.deptAnnouncement;
const User = db.user;
const Department = db.department
const Op = db.Sequelize.Op;
const catchAsync = require("../utils/catchAsync");
const logger = require('../loggers/logger');

// Create and Save a new Department Announcement Announcement
exports.create = catchAsync(async (req, res) => {
  // Validate request
  if (!req.body) {
    return res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  // Create a Department Announcement
  const departmentAnnouncement = {
    announcementTitle: req.body.announcementTitle,
    announcementDescription: req.body.announcementDescription,
    createdByUserId: req.body.createdByUserId,
    departmentId: req.body.departmentId,
    createdAt: new Date()
  };

  // Save Department Announcement in the database
  const data = await DepartmentAnnouncement.create(departmentAnnouncement);
  logger.info(`Department announcement created successfully with ID: ${data.id}`);
  res.status(201).send(data);
});

// Retrieve all Departments from the database.
exports.findAll = catchAsync(async (req, res) => {
  logger.info('Retrieving all department announcements.');
  const data = await DepartmentAnnouncement.findAll({
    where: { isDeleted: { [Op.ne]: true } },
    include: [{
      model: User
    }, {
      model: Department
    }]
  });
  res.send(data);
});

// Retrieve all Recent Department Announcements from the database.
exports.findAllRecent = catchAsync(async (req, res) => {
  logger.info('Retrieving recent department announcements.');
  const data = await DepartmentAnnouncement.findAll({
    where: { isDeleted: { [Op.ne]: true } },
    include: [{
      model: User
    }, {
      model: Department
    }],
    order: [["createdAt", "DESC"]],
    limit: 2
  });
  res.send(data);
});

// Retrieve all Recent Department Announcements from the database.
exports.findAllRecentByDeptId = catchAsync(async (req, res) => {
  let deptId = req.params.id
  logger.info(`Retrieving recent department announcements for department ID: ${deptId}`);
  const data = await DepartmentAnnouncement.findAll({
    where: { isDeleted: { [Op.ne]: true } },
    include: [{
      model: User
    }, {
      model: Department,
      where: {id: deptId}
    }],
    order: [["createdAt", "DESC"]],
    limit: 2
  });
  res.send(data);
});

//Retrieve all Departments By Department Id
exports.findAllByDeptId = catchAsync(async (req, res) => {
  const departmentId = req.params.id;
  logger.info(`Retrieving all department announcements for department ID: ${departmentId}`);
  const data = await DepartmentAnnouncement.findAll({
    include: [User, Department],
    where: { departmentId: departmentId, isDeleted: { [Op.ne]: true } }
  });
  res.send(data);
});

// Find a single Department Announcement with an id
exports.findOne = catchAsync(async (req, res) => {
  const id = req.params.id;
  logger.info(`Retrieving department announcement with ID: ${id}`);
  const data = await DepartmentAnnouncement.findByPk(id);
  res.send(data);
});

// Update an Department Announcement by the id in the request
exports.update = catchAsync(async (req, res) => {
  const id = req.params.id;
  logger.info(`Attempting to update department announcement with ID: ${id}`);
  const [num] = await DepartmentAnnouncement.update(req.body, {
    where: { id: id }
  });

  if (num == 1) {
    logger.info(`Department announcement updated successfully with ID: ${id}`);
    res.send({
      message: "Department Announcement was updated successfully."
    });
  } else {
    res.send({
      message: `Cannot update Department Announcement with id=${id}. Maybe Department Announcement was not found or req.body is empty!`
    });
  }
});

// Delete a Department Announcement with the specified id in the request
exports.delete = catchAsync(async (req, res) => {
  const id = req.params.id;
  logger.info(`Attempting to delete department announcement with ID: ${id}`);
  const [num] = await DepartmentAnnouncement.update({ isDeleted: true }, {
    where: { id: id }
  });

  if (num == 1) {
    logger.info(`Department announcement deleted successfully with ID: ${id}`);
    res.send({
      message: "Department Announcement was deleted successfully!"
    });
  } else {
    res.send({
      message: `Cannot delete Department Announcement with id=${id}. Maybe Department Announcement was not found!`
    });
  }
});

// Delete all Departments from the database.
exports.deleteAll = catchAsync(async (req, res) => {
  logger.warn('Attempting to delete all department announcements.');
  const [nums] = await DepartmentAnnouncement.update({ isDeleted: true }, {
    where: {},
  });
  logger.info(`${nums} department announcements were deleted successfully.`);
  res.send({ message: `${nums} Department Announcements were deleted successfully!` });
});

// Delete all Departments by Department Id.
exports.deleteAllByDeptId = catchAsync(async (req, res) => {
  const departmentId = req.params.id;
  logger.warn(`Attempting to delete all department announcements for department ID: ${departmentId}`);
  const [nums] = await DepartmentAnnouncement.update({ isDeleted: true }, {
    where: { departmentId: departmentId },
  });
  logger.info(`${nums} department announcements for department ID ${departmentId} were deleted successfully.`);
  res.send({ message: `${nums} Department Announcements were deleted successfully!` });
});