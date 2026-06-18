const db = require("../models");
const Skill = db.skills;
const catchAsync = require("../utils/catchAsync");

// Create and Save a new Skill
exports.create = catchAsync(async (req, res) => {
  // Validate request
  if (!req.body.skillName || !req.body.skillTypeId) {
    res.status(400).send({
      message: "skillName and skillTypeId can not be empty!",
    });
    return;
  }

  // Create a Skill
  const skill = {
    skillName: req.body.skillName,
    skillTypeId: req.body.skillTypeId,
  };

  const data = await Skill.create(skill);
  res.status(201).send(data);
});

// Retrieve all Skills from the database.
exports.findAll = catchAsync(async (req, res) => {
  const data = await Skill.findAll();
  res.send(data);
});

// Find a single Skill with an id
exports.findOne = catchAsync(async (req, res) => {
  const id = req.params.id;

  const data = await Skill.findByPk(id);
  if (data) {
    res.send(data);
  } else {
    res.status(404).send({
      message: `Cannot find Skill with id=${id}.`
    });
  }
});

// Update a Skill by the id in the request
exports.update = catchAsync(async (req, res) => {
  const id = req.params.id;

  const [num] = await Skill.update(req.body, {
    where: { id: id },
  });

  if (num == 1) {
    res.send({
      message: "Skill was updated successfully.",
    });
  } else {
    res.send({
      message: `Cannot update Skill with id=${id}. Maybe Skill was not found or req.body is empty!`,
    });
  }
});

// Delete a Skill with the specified id in the request
exports.delete = catchAsync(async (req, res) => {
  const id = req.params.id;

  const num = await Skill.destroy({
    where: { id: id },
  });

  if (num == 1) {
    res.send({
      message: "Skill was deleted successfully!",
    });
  } else {
    res.send({
      message: `Cannot delete Skill with id=${id}. Maybe Skill was not found!`,
    });
  }
});

// Delete all Skills from the database.
exports.deleteAll = catchAsync(async (req, res) => {
  const nums = await Skill.destroy({
    where: {},
    truncate: false,
  });
  res.send({ message: `${nums} Skills were deleted successfully!` });
});

// Find all Skills for a specific SkillType
exports.findAllBySkillType = catchAsync(async (req, res) => {
    const skillTypeId = req.params.id;
    const data = await Skill.findAll({ where: { skillTypeId: skillTypeId } });
    res.send(data);
});