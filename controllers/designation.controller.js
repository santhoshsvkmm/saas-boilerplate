const db = require("../models");
const Designation = db.desgination;
const catchAsync = require("../utils/catchAsync");

// Create and Save a new Designation
exports.create = catchAsync(async (req, res) => {
  // Validate request
  if (!req.body.designationName || !req.body.departmentId) {
    res.status(400).send({
      message: "designationName and departmentId can not be empty!",
    });
    return;
  }

  // Create a Designation
  const designation = {
    designationName: req.body.designationName,
    departmentId: req.body.departmentId,
  };

  const data = await Designation.create(designation);
  res.status(201).send(data);
});

// Retrieve all Designations from the database.
exports.findAll = catchAsync(async (req, res) => {
  const data = await Designation.findAll();
  res.send(data);
});

// Find a single Designation with an id
exports.findOne = catchAsync(async (req, res) => {
  const id = req.params.id;

  const data = await Designation.findByPk(id);
  if (data) {
    res.send(data);
  } else {
    res.status(404).send({
      message: `Cannot find Designation with id=${id}.`
    });
  }
});

// Update a Designation by the id in the request
exports.update = catchAsync(async (req, res) => {
  const id = req.params.id;

  const [num] = await Designation.update(req.body, {
    where: { id: id },
  });

  if (num == 1) {
    res.send({
      message: "Designation was updated successfully.",
    });
  } else {
    res.send({
      message: `Cannot update Designation with id=${id}. Maybe Designation was not found or req.body is empty!`,
    });
  }
});

// Delete a Designation with the specified id in the request
exports.delete = catchAsync(async (req, res) => {
  const id = req.params.id;

  const num = await Designation.destroy({
    where: { id: id },
  });

  if (num == 1) {
    res.send({
      message: "Designation was deleted successfully!",
    });
  } else {
    res.send({
      message: `Cannot delete Designation with id=${id}. Maybe Designation was not found!`,
    });
  }
});

// Delete all Designations from the database.
exports.deleteAll = catchAsync(async (req, res) => {
  const nums = await Designation.destroy({
    where: {},
    truncate: false,
  });
  res.send({ message: `${nums} Designations were deleted successfully!` });
});

// Find all Designations for a specific Department
exports.findAllByDepartment = catchAsync(async (req, res) => {
    const departmentId = req.params.id;
    const data = await Designation.findAll({ where: { departmentId: departmentId } });
    res.send(data);
});