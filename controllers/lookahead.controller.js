const db = require("../models");
const Lookahead = db.lookahead;
const Op = db.Sequelize.Op;
const moment = require('moment');
const catchAsync = require("../utils/catchAsync");
const logger = require('../loggers/logger');
const { clearCacheByTag } = require("../utils/cache.util");

// Create a new Lookahead (Sprint)
exports.create = catchAsync(async (req, res) => {
  const lookahead = await Lookahead.create(req.body);

  await clearCacheByTag(`lookaheads-for-version:${lookahead.projectVersionId}`);
  logger.info(`Lookahead plan '${lookahead.name}' created successfully with ID: ${lookahead.id}`);
  res.status(201).send(lookahead);
});

// Add a batch of tasks to a Lookahead plan
exports.addTasks = catchAsync(async (req, res) => {
  const { id } = req.params; // Lookahead ID
  const { taskIds } = req.body;

  const lookahead = await Lookahead.findByPk(id);
  if (!lookahead) {
    return res.status(404).send({ message: 'Lookahead plan not found.' });
  }

  const tasks = await db.task.findAll({ where: { id: { [Op.in]: taskIds } } });
  if (tasks.length !== taskIds.length) {
    return res.status(400).send({ message: 'One or more tasks were not found.' });
  }

  await lookahead.addTasks(tasks);

  await clearCacheByTag(`lookahead-details:${id}`);
  for (const task of tasks) {
    await clearCacheByTag(`task-lookaheads:${task.id}`);
  }
  logger.info(`Added ${tasks.length} tasks to Lookahead ID ${id}.`);
  res.status(200).send({ message: 'Tasks added successfully.' });
});

// Get details of a single Lookahead plan, including its tasks
exports.getDetails = catchAsync(async (req, res) => {
  const { id } = req.params;

  const lookahead = await Lookahead.findByPk(id, {
    include: [{
      model: db.task,
      attributes: ['id', 'name', 'startDate', 'endDate', 'status', 'progress'],
      through: { attributes: [] } // Don't include the join table attributes
    }]
  });

  if (!lookahead) {
    return res.status(404).send({ message: 'Lookahead plan not found.' });
  }

  logger.info(`Retrieved details for Lookahead ID ${id}.`);
  res.status(200).send(lookahead);
});

// Get all Lookahead plans for a specific project version
exports.findAllForProjectVersion = catchAsync(async (req, res) => {
  const { projectVersionId } = req.params;

  const lookaheads = await Lookahead.findAll({
    where: { projectVersionId: projectVersionId },
    order: [['startDate', 'ASC']],
  });

  logger.info(`Retrieved ${lookaheads.length} Lookahead plans for project version ID ${projectVersionId}.`);
  res.status(200).send(lookaheads);
});

// Get all active Lookahead plans
exports.findAllActive = catchAsync(async (req, res) => {
  logger.info(`Retrieving all active Lookahead plans.`);
  const lookaheads = await Lookahead.findAll({
    where: { status: 'active' },
    order: [['startDate', 'ASC']],
  });

  logger.info(`Retrieved ${lookaheads.length} active Lookahead plans.`);
  res.status(200).send(lookaheads);
});

// Update a Lookahead plan's status or other details
exports.update = catchAsync(async (req, res) => {
  const { id } = req.params;

  const lookahead = await Lookahead.findByPk(id);
  if (!lookahead) {
    return res.status(404).send({ message: 'Lookahead plan not found.' });
  }

  const [num] = await Lookahead.update(req.body, { where: { id: id } });

  if (num == 1) {
    await clearCacheByTag(`lookaheads-for-version:${lookahead.projectVersionId}`);
    await clearCacheByTag(`lookahead-details:${id}`);
    await clearCacheByTag(`lookahead-progress-summary:${id}`);
    logger.info(`Lookahead plan ID ${id} updated successfully.`);
    res.status(200).send({ message: 'Lookahead plan updated successfully.' });
  } else {
    res.status(400).send({ message: 'No changes were made to the lookahead plan.' });
  }
});

// Get a progress summary for a specific Lookahead plan
exports.getProgressSummary = catchAsync(async (req, res) => {
  const { id } = req.params;

  const lookahead = await Lookahead.findByPk(id, {
    include: [{
      model: db.task,
      attributes: ['status', 'progress', 'effort', 'completedAt'],
      through: { attributes: [] }
    }]
  });

  if (!lookahead) {
    return res.status(404).send({ message: 'Lookahead plan not found.' });
  }

  const tasks = lookahead.tasks;
  const totalEffort = tasks.reduce((sum, task) => sum + parseFloat(task.effort || 1), 0);

  if (totalEffort === 0) {
    return res.status(200).send({
      totalTasks: 0,
      totalEffort: 0,
      overallProgress: 0,
      statusCounts: { 'not-started': 0, 'in-progress': 0, 'completed': 0, 'on-hold': 0 }
    });
  }

  const completedEffort = tasks
    .filter(task => task.status === 'completed')
    .reduce((sum, task) => sum + parseFloat(task.effort || 1), 0);

  const overallProgress = (completedEffort / totalEffort) * 100;

  const statusCounts = tasks.reduce((counts, task) => {
    counts[task.status] = (counts[task.status] || 0) + 1;
    return counts;
  }, { 'not-started': 0, 'in-progress': 0, 'completed': 0, 'on-hold': 0 });

  const summary = {
    totalTasks: tasks.length,
    totalEffort,
    overallProgress: parseFloat(overallProgress.toFixed(2)),
    statusCounts,
  };

  logger.info(`Retrieved progress summary for Lookahead ID ${id}.`);
  res.status(200).send(summary);
});

// Remove a task from a Lookahead plan
exports.removeTask = catchAsync(async (req, res) => {
  const { id, taskId } = req.params; // Lookahead ID and Task ID

  const lookahead = await Lookahead.findByPk(id);
  if (!lookahead) {
    return res.status(404).send({ message: 'Lookahead plan not found.' });
  }

  const task = await db.task.findByPk(taskId);
  if (!task) {
    return res.status(404).send({ message: 'Task not found.' });
  }

  // The 'removeTask' method is automatically provided by Sequelize for the many-to-many relationship
  const result = await lookahead.removeTask(task);

  if (result) {
    await clearCacheByTag(`lookahead-details:${id}`);
    await clearCacheByTag(`lookahead-progress-summary:${id}`);
    await clearCacheByTag(`task-lookaheads:${taskId}`);
    logger.info(`Removed task ID ${taskId} from Lookahead ID ${id}.`);
    res.status(200).send({ message: 'Task removed successfully.' });
  } else {
    // This case happens if the task was not associated with the lookahead in the first place
    res.status(404).send({ message: 'Association not found.' });
  }
});

// Get a list of all tasks in a project version that are not in any look-ahead plan
exports.findUnplannedTasks = catchAsync(async (req, res) => {
  const { projectVersionId } = req.params;

  // 1. Find all task IDs that are already in a lookahead for this project version.
  const lookaheads = await Lookahead.findAll({
    where: { projectVersionId },
    include: [{
      model: db.task,
      attributes: ['id'],
      through: { attributes: [] }
    }]
  });

  const plannedTaskIds = lookaheads.flatMap(l => l.tasks.map(t => t.id));

  // 2. Find all tasks in the project version that are NOT in the planned list.
  const unplannedTasks = await db.task.findAll({
    where: {
      projectVersionId: projectVersionId,
      id: { [Op.notIn]: plannedTaskIds },
      isDeleted: { [Op.ne]: true }
    },
    order: [['startDate', 'ASC']]
  });

  logger.info(`Retrieved ${unplannedTasks.length} unplanned tasks for project version ID ${projectVersionId}.`);
  res.status(200).send(unplannedTasks);
});

// Get a burndown chart summary for a specific Lookahead plan
exports.getBurndownSummary = catchAsync(async (req, res) => {
  const { id } = req.params;

  const lookahead = await Lookahead.findByPk(id, {
    include: [{
      model: db.task,
      attributes: ['id', 'completedAt', 'effort'],
      through: { attributes: [] }
    }]
  });

  if (!lookahead) {
    return res.status(404).send({ message: 'Lookahead plan not found.' });
  }

  // Calculate total effort instead of total tasks
  const totalEffort = lookahead.tasks.reduce((sum, task) => sum + parseFloat(task.effort || 1), 0);

  if (totalEffort === 0) {
    return res.status(200).send([]);
  }

  const startDate = moment(lookahead.startDate);
  const endDate = moment(lookahead.endDate);
  const durationInDays = endDate.diff(startDate, 'days') + 1;
  // Calculate ideal burn rate based on total effort
  const idealBurnRate = durationInDays > 1 ? totalEffort / (durationInDays - 1) : totalEffort;

  const burndownData = [];

  for (let i = 0; i < durationInDays; i++) {
    const currentDate = moment(startDate).add(i, 'days');

    // Calculate ideal effort remaining
    const idealEffortRemaining = Math.max(0, totalEffort - (idealBurnRate * i));

    // Calculate actual effort remaining by summing the effort of completed tasks
    const completedEffort = lookahead.tasks.filter(task =>
      task.completedAt && moment(task.completedAt).isSameOrBefore(currentDate, 'day')
    ).reduce((sum, task) => sum + parseFloat(task.effort || 1), 0);
    const actualEffortRemaining = totalEffort - completedEffort;

    burndownData.push({
      date: currentDate.format('YYYY-MM-DD'),
      idealEffortRemaining: parseFloat(idealEffortRemaining.toFixed(2)),
      actualEffortRemaining: parseFloat(actualEffortRemaining.toFixed(2)),
    });
  }

  logger.info(`Generated burndown summary for Lookahead ID ${id}.`);
  res.status(200).send(burndownData);
});

// Internal helper to calculate velocity for a given project version
const _calculateVelocity = async (projectVersionId) => {
  // Find all completed lookaheads for the given project version
  const completedLookaheads = await Lookahead.findAll({
    where: {
      projectVersionId: projectVersionId,
      status: 'completed'
    },
    include: [{
      model: db.task,
      attributes: ['effort'],
      through: { attributes: [] }
    }],
    order: [['endDate', 'ASC']]
  });

  if (completedLookaheads.length === 0) {
    return {
      averageVelocity: 0,
      velocityData: []
    };
  }
  
  const velocityData = completedLookaheads.map(lookahead => {
    const totalEffort = lookahead.tasks.reduce((sum, task) => sum + parseFloat(task.effort || 1), 0);
    return {
      lookaheadId: lookahead.id,
      lookaheadName: lookahead.name,
      endDate: lookahead.endDate,
      completedEffort: totalEffort
    };
  });
  
  const totalCompletedEffort = velocityData.reduce((sum, item) => sum + item.completedEffort, 0);
  const averageVelocity = totalCompletedEffort / velocityData.length;

  return {
    averageVelocity: parseFloat(averageVelocity.toFixed(2)),
    velocityData
  };
};

// Get a velocity summary for a project version
exports.getVelocitySummary = catchAsync(async (req, res) => {
  const { projectVersionId } = req.params;

  const summary = await _calculateVelocity(projectVersionId);

  logger.info(`Generated velocity summary for project version ID ${projectVersionId}.`);
  res.status(200).send(summary);
});

// Get a list of all look-ahead plans that are falling behind schedule
exports.findAllBehindSchedule = catchAsync(async (req, res) => {
  logger.info('Retrieving look-ahead plans that are behind schedule.');

  const activeLookaheads = await Lookahead.findAll({
    where: { status: 'active' },
    include: [{
      model: db.task,
      attributes: ['status', 'effort'],
      through: { attributes: [] }
    }]
  });

  const behindSchedulePlans = [];

  for (const lookahead of activeLookaheads) {
    const totalEffort = lookahead.tasks.reduce((sum, task) => sum + parseFloat(task.effort || 1), 0);
    if (totalEffort === 0) continue;

    const completedEffort = lookahead.tasks
      .filter(task => task.status === 'completed')
      .reduce((sum, task) => sum + parseFloat(task.effort || 1), 0);

    const actualProgress = (completedEffort / totalEffort) * 100;

    const startDate = moment(lookahead.startDate);
    const endDate = moment(lookahead.endDate);
    const today = moment();

    const totalDuration = endDate.diff(startDate, 'days');
    const elapsedDuration = today.diff(startDate, 'days');

    const idealProgress = totalDuration > 0 ? (elapsedDuration / totalDuration) * 100 : (today.isAfter(endDate) ? 100 : 0);

    if (actualProgress < idealProgress) {
      behindSchedulePlans.push({
        ...lookahead.get({ plain: true }),
        actualProgress: parseFloat(actualProgress.toFixed(2)),
        idealProgress: parseFloat(Math.min(100, idealProgress).toFixed(2)), // Cap ideal progress at 100%
      });
    }
  }

  logger.info(`Found ${behindSchedulePlans.length} look-ahead plans behind schedule.`);
  res.status(200).send(behindSchedulePlans);
});

// Get a list of all look-ahead plans that are at risk of not finishing on time
exports.findAllAtRisk = catchAsync(async (req, res) => {
  logger.info('Retrieving look-ahead plans that are at risk.');

  const activeLookaheads = await Lookahead.findAll({
    where: { status: 'active' },
    include: [{
      model: db.task,
      attributes: ['status', 'effort'],
      through: { attributes: [] }
    }]
  });

  const atRiskPlans = [];
  const projectVelocities = {}; // Cache velocities to avoid re-calculating for the same project

  for (const lookahead of activeLookaheads) {
    // Get historical velocity for the project if not already fetched
    if (!projectVelocities[lookahead.projectVersionId]) {
      const velocitySummary = await _calculateVelocity(lookahead.projectVersionId);
      projectVelocities[lookahead.projectVersionId] = velocitySummary.averageVelocity;
    }
    const averageVelocity = projectVelocities[lookahead.projectVersionId];

    // If there's no historical velocity, we can't determine risk
    if (averageVelocity === 0) continue;

    const remainingEffort = lookahead.tasks
      .filter(task => task.status !== 'completed')
      .reduce((sum, task) => sum + parseFloat(task.effort || 1), 0);

    const remainingDays = moment(lookahead.endDate).diff(moment(), 'days');

    // Assuming lookaheads are typically 2 weeks (14 days) for velocity comparison
    const averageDailyEffort = averageVelocity / 14;
    const requiredDailyEffort = remainingDays > 0 ? remainingEffort / remainingDays : remainingEffort;

    if (requiredDailyEffort > averageDailyEffort) {
      atRiskPlans.push({
        ...lookahead.get({ plain: true }),
        requiredDailyEffort: parseFloat(requiredDailyEffort.toFixed(2)),
        averageDailyEffort: parseFloat(averageDailyEffort.toFixed(2)),
      });
    }
  };

  logger.info(`Found ${atRiskPlans.length} look-ahead plans at risk.`);
  res.status(200).send(atRiskPlans);
});

// Get a list of all look-ahead plans that are currently blocked
exports.findAllBlocked = catchAsync(async (req, res) => {
  logger.info('Retrieving look-ahead plans that are blocked.');

  const blockedLookaheads = await Lookahead.findAll({
    where: { status: 'active' },
    include: [{
      model: db.task,
      attributes: ['id', 'name', 'status', 'blocker_reason'],
      where: { status: 'blocked' },
      required: true, // This ensures we only get lookaheads that HAVE blocked tasks
      through: { attributes: [] }
    }],
    // The include already filters for lookaheads with blocked tasks,
    // but if you wanted to include all tasks and just know if it's blocked,
    // you would remove the `where` and `required` from the include
    // and then filter the results in javascript. This DB query is more efficient.
  });

  logger.info(`Found ${blockedLookaheads.length} blocked look-ahead plans.`);
  res.status(200).send(blockedLookaheads);
});

// Get a list of all look-ahead plans that are projected to finish early
exports.findAllProjectedEarly = catchAsync(async (req, res) => {
  logger.info('Retrieving look-ahead plans that are projected to finish early.');

  const activeLookaheads = await Lookahead.findAll({
    where: { status: 'active' },
    include: [{
      model: db.task,
      attributes: ['status', 'effort'],
      through: { attributes: [] }
    }]
  });

  const projectedEarlyPlans = [];
  const projectVelocities = {}; // Cache velocities to avoid re-calculating for the same project

  for (const lookahead of activeLookaheads) {
    // Get historical velocity for the project if not already fetched
    if (!projectVelocities[lookahead.projectVersionId]) {
      const velocitySummary = await _calculateVelocity(lookahead.projectVersionId);
      projectVelocities[lookahead.projectVersionId] = velocitySummary.averageVelocity;
    }
    const averageVelocity = projectVelocities[lookahead.projectVersionId];

    // If there's no historical velocity, we can't determine the projection
    if (averageVelocity === 0) continue;

    const remainingEffort = lookahead.tasks
      .filter(task => task.status !== 'completed')
      .reduce((sum, task) => sum + parseFloat(task.effort || 1), 0);

    const remainingDays = moment(lookahead.endDate).diff(moment(), 'days');

    // Assuming lookaheads are typically 2 weeks (14 days) for velocity comparison
    const averageDailyEffort = averageVelocity / 14;
    const requiredDailyEffort = remainingDays > 0 ? remainingEffort / remainingDays : remainingEffort;

    if (requiredDailyEffort > 0 && requiredDailyEffort < averageDailyEffort) {
      projectedEarlyPlans.push({
        ...lookahead.get({ plain: true }),
        requiredDailyEffort: parseFloat(requiredDailyEffort.toFixed(2)),
        averageDailyEffort: parseFloat(averageDailyEffort.toFixed(2)),
      });
    }
  }

  logger.info(`Found ${projectedEarlyPlans.length} look-ahead plans projected to finish early.`);
  res.status(200).send(projectedEarlyPlans);
});

// Move an unfinished task from one look-ahead plan to another
exports.moveTask = catchAsync(async (req, res) => {
  const { fromLookaheadId, taskId, toLookaheadId } = req.params;

  if (fromLookaheadId === toLookaheadId) {
    return res.status(400).send({ message: 'Source and destination look-ahead plans cannot be the same.' });
  }

  const t = await db.sequelize.transaction();

  try {
    const fromLookahead = await Lookahead.findByPk(fromLookaheadId, { transaction: t });
    const toLookahead = await Lookahead.findByPk(toLookaheadId, { transaction: t });
    const task = await db.task.findByPk(taskId, { transaction: t });

    if (!fromLookahead || !toLookahead || !task) {
      await t.rollback();
      return res.status(404).send({ message: 'One or more resources (task, source plan, or destination plan) not found.' });
    }

    if (task.status === 'completed') {
      await t.rollback();
      return res.status(400).send({ message: 'Cannot move a completed task.' });
    }

    // Perform the move within the transaction
    await fromLookahead.removeTask(task, { transaction: t });
    await toLookahead.addTask(task, { transaction: t });

    await t.commit();

    // Invalidate all relevant caches
    await clearCacheByTag(`lookahead-details:${fromLookaheadId}`);
    await clearCacheByTag(`lookahead-progress-summary:${fromLookaheadId}`);
    await clearCacheByTag(`lookahead-details:${toLookaheadId}`);
    await clearCacheByTag(`lookahead-progress-summary:${toLookaheadId}`);
    await clearCacheByTag(`task-lookaheads:${taskId}`);

    logger.info(`Moved task ID ${taskId} from look-ahead ID ${fromLookaheadId} to ${toLookaheadId}.`);
    res.status(200).send({ message: 'Task moved successfully.' });

  } catch (error) {
    await t.rollback();
    throw error;
  }
});