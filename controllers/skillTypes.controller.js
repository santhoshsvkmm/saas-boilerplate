const db = require("../models");
const SkillType = db.skillTypes;
const catchAsync = require("../utils/catchAsync");
const logger = require('../loggers/logger');

// Create and Save a new SkillType
exports.create = catchAsync(async (req, res) => {
  // Validate request
  if (!req.body.skillTypeName || !req.body.organisationId) {
    res.status(400).send({
      message: "skillTypeName and organisationId can not be empty!",
    });
    return;
  }

  // Create a SkillType
  const skillType = {
    skillTypeName: req.body.skillTypeName,
    organisationId: req.body.organisationId,
  };

  const data = await SkillType.create(skillType);
  logger.info(`Skill type created successfully with ID: ${data.id}`);
  res.status(201).send(data);
});

// Retrieve all SkillTypes from the database.
exports.findAll = catchAsync(async (req, res) => {
  logger.info('Retrieving all skill types.');
  const data = await SkillType.findAll({
    where: { isDeleted: { [Op.ne]: true } }
  });
  res.send(data);
});

// Find a single SkillType with an id
exports.findOne = catchAsync(async (req, res) => {
  const id = req.params.id;
  logger.info(`Retrieving skill type with ID: ${id}`);

  const data = await SkillType.findByPk(id);
  if (data) {
    res.send(data);
  } else {
    res.status(404).send({
      message: `Cannot find SkillType with id=${id}.`
    });
  }
});

// Update a SkillType by the id in the request
exports.update = catchAsync(async (req, res) => {
  const id = req.params.id;
  logger.info(`Attempting to update skill type with ID: ${id}`);

  const [num] = await SkillType.update(req.body, {
    where: { id: id },
  });

  if (num == 1) {
    logger.info(`Skill type updated successfully with ID: ${id}`);
    res.send({
      message: "SkillType was updated successfully.",
    });
  } else {
    res.send({
      message: `Cannot update SkillType with id=${id}. Maybe SkillType was not found or req.body is empty!`,
    });
  }
});

// Delete a SkillType with the specified id in the request
exports.delete = catchAsync(async (req, res) => {
  const id = req.params.id;
  logger.info(`Attempting to delete skill type with ID: ${id}`);

  const [num] = await SkillType.update({ isDeleted: true }, {
    where: { id: id },
  });

  if (num == 1) {
    logger.info(`Skill type deleted successfully with ID: ${id}`);
    res.send({
      message: "SkillType was deleted successfully!",
    });
  } else {
    res.send({
      message: `Cannot delete SkillType with id=${id}. Maybe SkillType was not found!`,
    });
  }
});

// Delete all SkillTypes from the database.
exports.deleteAll = catchAsync(async (req, res) => {
  logger.warn('Attempting to delete all skill types.');
  const [nums] = await SkillType.update({ isDeleted: true }, {
    where: {},
  });
  logger.info(`${nums} skill types were deleted successfully.`);
  res.send({ message: `${nums} SkillTypes were deleted successfully!` });
});

// Find all SkillTypes for a specific Organisation
exports.findAllByOrganisation = catchAsync(async (req, res) => {
    const organisationId = req.params.id;
    logger.info(`Retrieving all skill types for organisation ID: ${organisationId}`);
    const data = await SkillType.findAll({ 
      where: { organisationId: organisationId, isDeleted: { [Op.ne]: true } } 
    });
    res.send(data);
});