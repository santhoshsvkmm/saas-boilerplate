const db = require("../models");
const PersonalEvent = db.userPersonalEvent;
const Op = db.Sequelize.Op;
const catchAsync = require("../utils/catchAsync");

// Create and Save a new PersonalEvent
exports.create = catchAsync(async (req, res) => {
    // Validate request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  // Create a PersonalEvent
  const personalEvent = {
    eventTitle: req.body.eventTitle,
    eventDescription: req.body.eventDescription,
    eventStartDate: req.body.eventStartDate,
    eventEndDate: req.body.eventEndDate,
    userId: req.body.userId
  };

  // Save PersonalEvent in the database
  const data = await PersonalEvent.create(personalEvent);
  res.send(data);
});

// Retrieve all Personal Events from the database.
exports.findAll = catchAsync(async (req, res) => {
  const data = await PersonalEvent.findAll();
  res.send(data);
});

//Retrieve all Personal Events By User Id
exports.findAllByUserId = catchAsync(async (req, res) => {
    const userId = req.params.id;
    const loggedInUserId = req.authData.user.id;

    if (loggedInUserId.toString() !== userId && req.authData.user.role !== 'ROLE_ADMIN') {
      return res.status(403).send({ message: "Access denied." });
    }

    const data = await PersonalEvent.findAll({where: {userId: userId}});
    res.send(data);
});

// Find a single PersonalEvent with an id
exports.findOne = catchAsync(async (req, res) => {
  const id = req.params.id;

  const data = await PersonalEvent.findByPk(id);
  res.send(data);
});

// Update an PersonalEvent by the id in the request
exports.update = catchAsync(async (req, res) => {
  const id = req.params.id;

  const [num] = await PersonalEvent.update(req.body, {
    where: { id: id }
  });

  if (num == 1) {
    res.send({
      message: "PersonalEvent was updated successfully."
    });
  } else {
    res.send({
      message: `Cannot update PersonalEvent with id=${id}. Maybe PersonalEvent was not found or req.body is empty!`
    });
  }
});

// Delete an PersonalEvent with the specified id in the request
exports.delete = catchAsync(async (req, res) => {
  const id = req.params.id;

  const num = await PersonalEvent.destroy({
    where: { id: id }
  });

  if (num == 1) {
    res.send({
      message: "PersonalEvent was deleted successfully!"
    });
  } else {
    res.send({
      message: `Cannot delete PersonalEvent with id=${id}. Maybe Tutorial was not found!`
    });
  }
});

// Delete all Personal Events from the database.
exports.deleteAll = catchAsync(async (req, res) => {
  const nums = await PersonalEvent.destroy({
    where: {},
    truncate: false
  });
  res.send({ message: `${nums} Personal Events were deleted successfully!` });
});

// Delete all Personal Events by User Id.
exports.deleteAllByUserId = catchAsync(async (req, res) => {
    const userId = req.params.id;

    const nums = await PersonalEvent.destroy({
      where: {userId: userId},
      truncate: false
    });
    res.send({ message: `${nums} Personal Events were deleted successfully!` });
});