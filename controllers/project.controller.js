const db = require("../models");
const Project = db.project;
const User = db.user;
const Op = db.Sequelize.Op;
const catchAsync = require("../utils/catchAsync");
const logger = require('../loggers/logger');
const { clearCacheByTag } = require('../utils/cache.util');

// Create and Save a new Project
exports.create = catchAsync(async (req, res) => {
  const project = {
    projectName: req.body.projectName,
    description: req.body.description,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
    status: req.body.status || 'planning',
    userId: req.body.userId,
    organisationId: req.body.organisationId,
  };

  const data = await Project.create(project);
  logger.info(`Project created successfully with ID: ${data.id}`);
  await clearCacheByTag('projects');
  res.status(201).send(data);
});

// Retrieve all Projects from the database.
exports.findAll = catchAsync(async (req, res) => {
  logger.info('Retrieving all projects.');
  const data = await Project.findAll({
    where: { isDeleted: { [Op.ne]: true } },
    include: [{ model: User, attributes: ['id', 'fullName'] }]
  });
  res.send(data);
});

// Find a single Project with an id
exports.findOne = catchAsync(async (req, res) => {
  const id = req.params.id;
  logger.info(`Retrieving project with ID: ${id}`);
  const data = await Project.findOne({
    where: { id: id, isDeleted: { [Op.ne]: true } },
    include: [{ model: User, attributes: ['id', 'fullName'] }]
  });
  res.send(data);
});

// Retrieve all Projects for a specific User
exports.findAllByUser = catchAsync(async (req, res) => {
  const userId = req.params.id;
  logger.info(`Retrieving all projects for user ID: ${userId}`);
  const data = await Project.findAll({
    where: { userId: userId, isDeleted: { [Op.ne]: true } },
    include: [{ model: User, attributes: ['id', 'fullName'] }]
  });
  res.send(data);
});

// Retrieve all Projects for a specific Organisation
exports.findAllByOrganisation = catchAsync(async (req, res) => {
  const organisationId = req.params.id;
  logger.info(`Retrieving all projects for organisation ID: ${organisationId}`);
  const data = await Project.findAll({
    where: { organisationId: organisationId, isDeleted: { [Op.ne]: true } },
    include: [{ model: User, attributes: ['id', 'fullName'] }]
  });
  res.send(data);
});

// Update a Project by the id in the request
exports.update = catchAsync(async (req, res) => {
  const id = req.params.id;
  logger.info(`Attempting to update project with ID: ${id}`);

  const [num] = await Project.update(req.body, {
    where: { id: id }
  });

  if (num == 1) {
    logger.info(`Project updated successfully with ID: ${id}`);
    await clearCacheByTag('projects');
    res.send({
      message: "Project was updated successfully."
    });
  } else {
    res.send({
      message: `Cannot update Project with id=${id}. Maybe Project was not found or req.body is empty!`
    });
  }
});

// Delete a Project with the specified id in the request
exports.delete = catchAsync(async (req, res) => {
  const id = req.params.id;
  logger.info(`Attempting to soft-delete project with ID: ${id}`);

  const [num] = await Project.update({ isDeleted: true }, {
    where: { id: id }
  });

  if (num == 1) {
    logger.info(`Project soft-deleted successfully with ID: ${id}`);
    await clearCacheByTag('projects');
    res.send({
      message: "Project was deleted successfully!"
    });
  } else {
    res.send({
      message: `Cannot delete Project with id=${id}. Maybe Project was not found!`
    });
  }
});

// Delete all Projects from the database.
exports.deleteAll = catchAsync(async (req, res) => {
  logger.warn('Attempting to soft-delete all projects.');
  const [nums] = await Project.update({ isDeleted: true }, {
    where: {},
  });
  await clearCacheByTag('projects');
  logger.info(`${nums} projects were soft-deleted successfully.`);
  res.send({ message: `${nums} Projects were deleted successfully!` });
});

// Associate a Consultant with a Project
exports.addConsultant = catchAsync(async (req, res) => {
  const { projectId } = req.params;
  const { consultantId } = req.body;

  const project = await Project.findByPk(projectId);
  if (!project) {
    return res.status(404).send({ message: 'Project not found' });
  }

  const consultant = await db.consultant.findByPk(consultantId);
  if (!consultant) {
    return res.status(404).send({ message: 'Consultant not found' });
  }

  await project.addConsultant(consultant);
  logger.info(`Associated consultant ID ${consultantId} with project ID ${projectId}`);

  res.status(200).send({ message: 'Consultant associated successfully.' });
});

// Get all consultants for a specific project
exports.getConsultants = catchAsync(async (req, res) => {
  const { projectId } = req.params;
  const project = await Project.findByPk(projectId);

  if (!project) {
    return res.status(404).send({ message: 'Project not found' });
  }

  const consultants = await project.getConsultants({
    where: { isDeleted: { [Op.ne]: true } },
    attributes: ['id', 'consultant_organisation_name', 'contact_person_firstname', 'contact_person_lastname', 'email'],
    joinTableAttributes: [] // Exclude attributes from the join table
  });

  logger.info(`Retrieved ${consultants.length} consultants for project ID ${projectId}`);
  res.status(200).send(consultants);
});

// Generate a Material Procurement Plan from a Project's tasks
exports.generateProcurementPlan = catchAsync(async (req, res) => {
  const { projectId } = req.params;
  const { plannedDate } = req.body;

  // 1. Find all tasks associated with the project
  const projectVersions = await db.projectverison.findAll({ where: { projectId } });
  const versionIds = projectVersions.map(v => v.id);

  const tasks = await db.task.findAll({
    where: { projectVersionId: { [Op.in]: versionIds } },
    include: [{
      model: db.material,
      through: { attributes: ['quantity'] } // Get quantity from the join table
    }]
  });

  if (tasks.length === 0) {
    return res.status(200).send({ message: 'No tasks found for this project to generate a plan from.' });
  }

  // 2. Aggregate material requirements
  const materialMap = new Map();
  tasks.forEach(task => {
    task.materials.forEach(material => {
      const requiredQuantity = material.taskresourcedetails.quantity;
      if (materialMap.has(material.id)) {
        materialMap.set(material.id, materialMap.get(material.id) + requiredQuantity);
      } else {
        materialMap.set(material.id, requiredQuantity);
      }
    });
  });

  // 3. Create procurement plan entries
  const procurementPlanEntries = Array.from(materialMap.entries()).map(([materialId, totalQuantity]) => ({
    material_id: materialId,
    planned_quantity: totalQuantity,
    planned_date: plannedDate || new Date(), // Use provided date or default to now
    projectId: projectId,
  }));

  await db.materialProcurementPlan.bulkCreate(procurementPlanEntries);

  logger.info(`Generated ${procurementPlanEntries.length} procurement plan entries for project ID: ${projectId}`);
  res.status(201).send({ message: `Successfully generated ${procurementPlanEntries.length} procurement plan entries.` });
});

// Set a specific project version as the active/baseline version for a project
exports.setActiveVersion = catchAsync(async (req, res) => {
  const { projectId, versionId } = req.params;
  logger.info(`Attempting to set project version ID ${versionId} as active for project ID ${projectId}.`);

  const project = await Project.findByPk(projectId);
  if (!project) {
    return res.status(404).send({ message: 'Project not found.' });
  }

  const projectVersion = await db.projectverison.findByPk(versionId);
  if (!projectVersion) {
    return res.status(404).send({ message: 'Project version not found.' });
  }

  if (projectVersion.projectId !== parseInt(projectId)) {
    return res.status(400).send({ message: 'Project version does not belong to the specified project.' });
  }

  // Update the project's activeProjectVersionId
  const [num] = await Project.update(
    { activeProjectVersionId: versionId },
    { where: { id: projectId } }
  );

  if (num == 1) {
    logger.info(`Project ID ${projectId} active version set to ${versionId}.`);
    await clearCacheByTag('projects'); // Clear general projects cache
    await clearCacheByTag(`project:${projectId}`); // Clear specific project cache
    res.status(200).send({ message: `Project version ID ${versionId} set as active for project ID ${projectId}.` });
  } else {
    res.status(400).send({ message: `Failed to set active project version for project ID ${projectId}.` });
  }
});

// Get a summary of total hours assigned to a specific project
exports.getHoursSummary = catchAsync(async (req, res) => {
  const projectId = req.params.id;

  const result = await db.taskresourcedetails.findOne({
    attributes: [
      [db.sequelize.fn('SUM', db.sequelize.col('hours')), 'totalHours']
    ],
    include: [{
      model: db.task,
      attributes: [],
      required: true,
      include: [{
        model: db.projectverison,
        attributes: [],
        required: true,
        where: { projectId: projectId }
      }]
    }],
    raw: true,
  });

  const totalHours = parseFloat(result.totalHours) || 0;

  logger.info(`Retrieved total hours summary for project ID ${projectId}: ${totalHours}`);
  res.status(200).send({ projectId, totalHours });
});