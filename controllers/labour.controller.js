const db = require("../models");
const Labour = db.labour;
const Op = db.Sequelize.Op;
const catchAsync = require("../utils/catchAsync");
const logger = require('../loggers/logger');
const { clearCacheByTag } = require('../utils/cache.util');

// Create and Save a new Labour
exports.create = catchAsync(async (req, res) => {
  const existingLabour = await Labour.findOne({ where: { email: req.body.email, organisation_id: req.body.organisation_id } });
  if (existingLabour) {
    logger.warn(`Labour creation failed: email '${req.body.email}' already exists in this organisation.`);
    return res.status(409).send({ message: "A labourer with this email already exists in this organisation." });
  }

  const data = await Labour.create(req.body);
  logger.info(`Labourer created successfully with ID: ${data.id}`);
  await clearCacheByTag('labours');
  res.status(201).send(data);
});

// Retrieve all Labourers from the database.
exports.findAll = catchAsync(async (req, res) => {
  logger.info('Retrieving all labourers.');
  const data = await Labour.findAll({
    where: { isDeleted: { [Op.ne]: true } }
  });
  res.send(data);
});

// Find a single Labourer with an id
exports.findOne = catchAsync(async (req, res) => {
  const id = req.params.id;
  logger.info(`Retrieving labourer with ID: ${id}`);
  const data = await Labour.findOne({
    where: { id: id, isDeleted: { [Op.ne]: true } }
  });
  res.send(data);
});

// Retrieve all Labourers for a specific Organisation
exports.findAllByOrganisation = catchAsync(async (req, res) => {
  const organisationId = req.params.id;
  logger.info(`Retrieving all labourers for organisation ID: ${organisationId}`);
  const data = await Labour.findAll({
    where: { organisation_id: organisationId, isDeleted: { [Op.ne]: true } }
  });
  res.send(data);
});

// Retrieve all Labourers for a specific Subcontractor
exports.findAllBySubcontractor = catchAsync(async (req, res) => {
  const subcontractorId = req.params.id;
  logger.info(`Retrieving all labourers for subcontractor ID: ${subcontractorId}`);
  const data = await Labour.findAll({
    where: { sub_contractor_id: subcontractorId, isDeleted: { [Op.ne]: true } }
  });
  res.send(data);
});

// Update a Labourer by the id in the request
exports.update = catchAsync(async (req, res) => {
  const id = req.params.id;
  logger.info(`Attempting to update labourer with ID: ${id}`);

  const [num] = await Labour.update(req.body, {
    where: { id: id }
  });

  if (num == 1) {
    logger.info(`Labourer updated successfully with ID: ${id}`);
    await clearCacheByTag('labours');
    res.send({
      message: "Labourer was updated successfully."
    });
  } else {
    res.send({
      message: `Cannot update Labourer with id=${id}. Maybe it was not found or req.body is empty!`
    });
  }
});

// Delete a Labourer with the specified id in the request
exports.delete = catchAsync(async (req, res) => {
  const id = req.params.id;
  logger.info(`Attempting to soft-delete labourer with ID: ${id}`);

  const [num] = await Labour.update({ isDeleted: true }, {
    where: { id: id }
  });

  if (num == 1) {
    logger.info(`Labourer soft-deleted successfully with ID: ${id}`);
    await clearCacheByTag('labours');
    res.send({
      message: "Labourer was deleted successfully!"
    });
  } else {
    res.send({
      message: `Cannot delete Labourer with id=${id}. Maybe it was not found!`
    });
  }
});

exports.deleteAllByOrganisation = catchAsync(async (req, res) => {
  const organisationId = req.params.id;
  logger.warn(`Attempting to soft-delete all labourers for organisation ID: ${organisationId}`);
  const [nums] = await Labour.update({ isDeleted: true }, {
    where: { organisation_id: organisationId },
  });
  await clearCacheByTag('labours');
  logger.info(`${nums} labourers for organisation ID ${organisationId} were soft-deleted successfully.`);
  res.send({ message: `${nums} Labourers were deleted successfully!` });
});

// Get all tasks for a specific labourer
exports.getTasks = catchAsync(async (req, res) => {
  const { id } = req.params; // Labourer ID
  const labourer = await Labour.findByPk(id);

  if (!labourer) {
    return res.status(404).send({ message: 'Labourer not found' });
  }

  const tasks = await labourer.getTasks({
    where: { isDeleted: { [Op.ne]: true } },
    attributes: ['id', 'name', 'description', 'startDate', 'endDate', 'status'],
    joinTableAttributes: ['hours']
  });

  logger.info(`Retrieved ${tasks.length} tasks for labourer ID ${id}`);
  res.status(200).send(tasks);
});

// Get a summary of total hours assigned to a labourer
exports.getHoursSummary = catchAsync(async (req, res) => {
  const { id } = req.params; // Labourer ID

  const result = await db.taskresourcedetails.findOne({
    attributes: [
      [db.sequelize.fn('SUM', db.sequelize.col('hours')), 'totalHours']
    ],
    where: {
      labour_id: id
    },
    raw: true,
  });

  const totalHours = parseFloat(result.totalHours) || 0;
  logger.info(`Retrieved total hours summary for labourer ID ${id}: ${totalHours}`);
  res.status(200).send({ labourerId: id, totalHours });
});

// Get a list of all projects a labourer has clocked hours on
exports.getProjects = catchAsync(async (req, res) => {
  const { id } = req.params; // Labourer ID

  const projects = await db.project.findAll({
    include: [{
      model: db.labourAttendance,
      required: true, // This makes it an INNER JOIN
      where: { labour_id: id },
      attributes: [] // We don't need attributes from the attendance table
    }],
    group: ['project.id'], // Ensure unique projects
  });

  if (!projects) {
    return res.status(200).send([]);
  }

  logger.info(`Retrieved ${projects.length} projects for labourer ID ${id}`);
  res.status(200).send(projects);
});