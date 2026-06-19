const db = require("../models");
const Task = db.task;
const Op = db.Sequelize.Op;
const catchAsync = require("../utils/catchAsync");
const logger = require('../loggers/logger');
const { clearCacheByTag } = require('../utils/cache.util');

// Create and Save a new Task
exports.create = catchAsync(async (req, res) => {
  const data = await Task.create(req.body);
  logger.info(`Task created successfully with ID: ${data.id}`);
  await clearCacheByTag('tasks');
  await clearCacheByTag(`project-version-tasks:${data.projectVersionId}`);
  if (data.phaseId) {
    await clearCacheByTag(`phase-tasks:${data.phaseId}`);
  }
  res.status(201).send(data);
});

// Retrieve all Tasks from the database.
exports.findAll = catchAsync(async (req, res) => {
  logger.info('Retrieving all tasks.');
  const data = await Task.findAll({ where: { isDeleted: { [Op.ne]: true } } });
  res.send(data);
});

// Find a single Task with an id
exports.findOne = catchAsync(async (req, res) => {
  const id = req.params.id;
  logger.info(`Retrieving task with ID: ${id}`);
  const data = await Task.findOne({ where: { id: id, isDeleted: { [Op.ne]: true } } });
  res.send(data);
});

// Retrieve all Tasks for a specific Project Version
exports.findAllByProjectVersion = catchAsync(async (req, res) => {
  const projectVersionId = req.params.id;
  logger.info(`Retrieving all tasks for project version ID: ${projectVersionId}`);
  const data = await Task.findAll({
    where: { projectVersionId: projectVersionId, isDeleted: { [Op.ne]: true } }
  });
  res.send(data);
});

// Retrieve all Tasks for a specific Phase
exports.findAllByPhase = catchAsync(async (req, res) => {
  const phaseId = req.params.id;
  logger.info(`Retrieving all tasks for phase ID: ${phaseId}`);
  const data = await Task.findAll({
    where: { phaseId: phaseId, isDeleted: { [Op.ne]: true } }
  });
  res.send(data);
});

// Update a Task by the id in the request
exports.update = catchAsync(async (req, res) => {
  const id = req.params.id;
  logger.info(`Attempting to update task with ID: ${id}`);

  const task = await Task.findByPk(id);
  if (!task) {
    return res.status(404).send({ message: `Cannot find Task with id=${id}.` });
  }

  // Automatically set completion date if status is changed to 'completed'
  if (req.body.status === 'completed' && task.status !== 'completed') {
    req.body.completedAt = new Date();
  }

  const [num] = await Task.update(req.body, { where: { id: id } });

  if (num == 1) {
    logger.info(`Task updated successfully with ID: ${id}`);
    await clearCacheByTag('tasks');
    await clearCacheByTag(`project-version-tasks:${task.projectVersionId}`);
    if (task.phaseId) {
      await clearCacheByTag(`phase-tasks:${task.phaseId}`);
    }
    // If the status changed, invalidate lookahead summaries that might be affected
    if (req.body.status) {
      const lookaheads = await task.getLookaheads({ attributes: ['id'] });
      for (const lookahead of lookaheads) {
        await clearCacheByTag(`lookahead-progress-summary:${lookahead.id}`);
      }
    }
    res.send({ message: "Task was updated successfully." });
  } else {
    res.send({ message: `Cannot update Task with id=${id}. Maybe it was not found or req.body is empty!` });
  }
});

// Delete a Task with the specified id in the request
exports.delete = catchAsync(async (req, res) => {
  const id = req.params.id;
  logger.info(`Attempting to soft-delete task with ID: ${id}`);

  const task = await Task.findByPk(id);
  if (!task) {
    return res.status(404).send({ message: `Cannot find Task with id=${id}.` });
  }

  const [num] = await Task.update({ isDeleted: true }, { where: { id: id } });

  if (num == 1) {
    logger.info(`Task soft-deleted successfully with ID: ${id}`);
    await clearCacheByTag('tasks');
    await clearCacheByTag(`project-version-tasks:${task.projectVersionId}`);
    if (task.phaseId) {
      await clearCacheByTag(`phase-tasks:${task.phaseId}`);
    }
    res.send({ message: "Task was deleted successfully!" });
  } else {
    res.send({ message: `Cannot delete Task with id=${id}.` });
  }
});

// Consume stock for a given task
exports.consumeStock = catchAsync(async (req, res) => {
  const { id } = req.params;
  const t = await db.sequelize.transaction();

  try {
    // 1. Check if stock has already been consumed for this task
    const existingConsumption = await db.materialStockHistory.findOne({
      where: { reason: 'consumed_in_task', related_entity_id: id },
      transaction: t,
    });

    if (existingConsumption) {
      await t.rollback();
      return res.status(409).send({ message: 'Stock has already been consumed for this task.' });
    }

    // 2. Find the task and its required materials
    const task = await Task.findByPk(id, {
      include: [{
        model: db.material,
        through: { attributes: ['quantity'] }
      }],
      transaction: t,
    });

    if (!task || !task.materials || task.materials.length === 0) {
      await t.rollback();
      return res.status(404).send({ message: 'No materials found for this task.' });
    }

    // 3. Decrement stock and create history records for each material
    for (const material of task.materials) {
      const consumedQuantity = material.taskresourcedetails.quantity;

      // Check for sufficient stock before consumption
      if (parseFloat(material.quantity_in_stock) < parseFloat(consumedQuantity)) {
        await t.rollback();
        return res.status(400).send({ message: `Insufficient stock for material: ${material.name}. Required: ${consumedQuantity}, Available: ${material.quantity_in_stock}` });
      }

      const newStock = parseFloat(material.quantity_in_stock) - parseFloat(consumedQuantity);

      await material.update({ quantity_in_stock: newStock }, { transaction: t });

      await db.materialStockHistory.create({
        material_id: material.id,
        change_quantity: -consumedQuantity,
        new_quantity: newStock,
        reason: 'consumed_in_task',
        related_entity_id: id,
      }, { transaction: t });
    }

    await t.commit();

    logger.info(`Stock consumed successfully for task ID: ${id}`);
    res.status(200).send({ message: 'Stock consumed successfully.' });
  } catch (error) {
    await t.rollback();
    throw error;
  }
});

// Associate a Labourer with a Task
exports.addLabourer = catchAsync(async (req, res) => {
  const { id } = req.params; // Task ID
  const { labourerId, hours } = req.body;

  const task = await Task.findByPk(id);
  if (!task) {
    return res.status(404).send({ message: 'Task not found' });
  }

  const labourer = await db.labour.findByPk(labourerId);
  if (!labourer) {
    return res.status(404).send({ message: 'Labourer not found' });
  }

  // The 'addLabour' method is automatically created by Sequelize
  await task.addLabour(labourer, { through: { hours: hours || 0 } });

  // Invalidate cache for this task's details if it exists
  await clearCacheByTag(`task-labourers:${id}`);
  await clearCacheByTag(`labourer-tasks:${labourerId}`);
  await clearCacheByTag(`labourer-hours-summary:${labourerId}`);
  if (task.projectVersionId) {
    const projectVersion = await db.projectverison.findByPk(task.projectVersionId);
    if (projectVersion && projectVersion.projectId) {
      await clearCacheByTag(`project-hours-summary:${projectVersion.projectId}`);
    }
  }

  logger.info(`Associated labourer ID ${labourerId} with task ID ${id}`);

  res.status(200).send({ message: 'Labourer associated successfully.' });
});

// Get all labourers for a specific task
exports.getLabourers = catchAsync(async (req, res) => {
  const { id } = req.params; // Task ID
  const task = await Task.findByPk(id);

  if (!task) {
    return res.status(404).send({ message: 'Task not found' });
  }

  const labourers = await task.getLabours({
    where: { isDeleted: { [Op.ne]: true } },
    attributes: ['id', 'first_name', 'last_name', 'email', 'phone_number'],
    joinTableAttributes: ['hours'] // Include attributes from the join table
  });

  logger.info(`Retrieved ${labourers.length} labourers for task ID ${id}`);
  res.status(200).send(labourers);
});

// Remove a Labourer from a Task
exports.removeLabourer = catchAsync(async (req, res) => {
  const { id, labourerId } = req.params; // Task ID and Labourer ID

  const task = await Task.findByPk(id);
  if (!task) {
    return res.status(404).send({ message: 'Task not found' });
  }

  const labourer = await db.labour.findByPk(labourerId);
  if (!labourer) {
    return res.status(404).send({ message: 'Labourer not found' });
  }

  // The 'removeLabour' method is automatically created by Sequelize
  const result = await task.removeLabour(labourer);

  if (result) {
    await clearCacheByTag(`task-labourers:${id}`);
    await clearCacheByTag(`labourer-tasks:${labourerId}`);
    await clearCacheByTag(`labourer-hours-summary:${labourerId}`);
    if (task.projectVersionId) {
      const projectVersion = await db.projectverison.findByPk(task.projectVersionId);
      if (projectVersion && projectVersion.projectId) {
        await clearCacheByTag(`project-hours-summary:${projectVersion.projectId}`);
      }
    }
    logger.info(`Removed labourer ID ${labourerId} from task ID ${id}`);
    res.status(200).send({ message: 'Labourer removed from task successfully.' });
  } else {
    res.status(404).send({ message: 'Association not found.' });
  }
});

// Get all look-ahead plans containing a specific task
exports.getLookaheads = catchAsync(async (req, res) => {
  const { id } = req.params; // Task ID
  const task = await Task.findByPk(id);

  if (!task) {
    return res.status(404).send({ message: 'Task not found' });
  }

  const lookaheads = await task.getLookaheads({
    attributes: ['id', 'name', 'startDate', 'endDate', 'status'],
    joinTableAttributes: []
  });

  logger.info(`Retrieved ${lookaheads.length} look-ahead plans for task ID ${id}`);
  res.status(200).send(lookaheads);
});