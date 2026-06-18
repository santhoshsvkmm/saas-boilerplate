const db = require("../models");
const Branch = db.branch;
const catchAsync = require("../utils/catchAsync");

// Create and Save a new Branch
exports.create = catchAsync(async (req, res) => {
  // Validate request
  if (!req.body.branchName || !req.body.organisationId) {
    res.status(400).send({
      message: "branchName and organisationId can not be empty!",
    });
    return;
  }

  // Create a Branch
  const branch = {
    branchName: req.body.branchName,
    isActive: req.body.isActive !== undefined ? req.body.isActive : true,
    organisationId: req.body.organisationId,
  };

  const data = await Branch.create(branch);
  res.status(201).send(data);
});

// Retrieve all Branches from the database.
exports.findAll = catchAsync(async (req, res) => {
  const data = await Branch.findAll();
  res.send(data);
});

// Find a single Branch with an id
exports.findOne = catchAsync(async (req, res) => {
  const id = req.params.id;

  const data = await Branch.findByPk(id);
  if (data) {
    res.send(data);
  } else {
    res.status(404).send({
      message: `Cannot find Branch with id=${id}.`
    });
  }
});

// Update a Branch by the id in the request
exports.update = catchAsync(async (req, res) => {
  const id = req.params.id;

  const [num] = await Branch.update(req.body, {
    where: { id: id },
  });

  if (num == 1) {
    res.send({
      message: "Branch was updated successfully.",
    });
  } else {
    res.send({
      message: `Cannot update Branch with id=${id}. Maybe Branch was not found or req.body is empty!`,
    });
  }
});

// Delete a Branch with the specified id in the request
exports.delete = catchAsync(async (req, res) => {
  const id = req.params.id;

  const num = await Branch.destroy({
    where: { id: id },
  });

  if (num == 1) {
    res.send({
      message: "Branch was deleted successfully!",
    });
  } else {
    res.send({
      message: `Cannot delete Branch with id=${id}. Maybe Branch was not found!`,
    });
  }
});

// Delete all Branches from the database.
exports.deleteAll = catchAsync(async (req, res) => {
  const nums = await Branch.destroy({
    where: {},
    truncate: false,
  });
  res.send({ message: `${nums} Branches were deleted successfully!` });
});

// Find all Branches for a specific Organisation
exports.findAllByOrganisation = catchAsync(async (req, res) => {
    const organisationId = req.params.id;
    const data = await Branch.findAll({ where: { organisationId: organisationId } });
    res.send(data);
});