const db = require("../models");
const catchAsync = require("../utils/catchAsync");
const logger = require('../loggers/logger');
const moment = require('moment');

const calculateDuration = (start, end) => {
  // Using moment.js to calculate the difference in days. Add 1 to be inclusive.
  return moment(end).diff(moment(start), 'days') + 1;
};

// Get the critical path for a specific project version
exports.getCriticalPath = catchAsync(async (req, res) => {
  const { id } = req.params;
  logger.info(`Calculating critical path for project version ID: ${id}`);

  const tasks = await db.task.findAll({
    where: { projectVersionId: id, isDeleted: { [db.Sequelize.Op.ne]: true } },
    raw: true,
  });

  if (tasks.length === 0) {
    return res.status(200).send([]);
  }

  const tasksMap = new Map(tasks.map(task => [task.id, { ...task, duration: calculateDuration(task.startDate, task.endDate), successors: [], predecessors: task.predecessor || [] }]));

  // Build the graph by populating successors
  for (const task of tasksMap.values()) {
    if (task.predecessor) {
      for (const predId of task.predecessor) {
        if (tasksMap.has(predId)) {
          tasksMap.get(predId).successors.push(task.id);
        }
      }
    }
  }

  // Forward pass to calculate Earliest Start (ES) and Earliest Finish (EF)
  for (const task of tasksMap.values()) {
    if (task.predecessors.length === 0) {
      task.es = 0;
    } else {
      task.es = Math.max(...task.predecessors.map(predId => tasksMap.get(predId).ef || 0));
    }
    task.ef = task.es + task.duration;
  }

  // Find project completion time
  const projectCompletionTime = Math.max(...Array.from(tasksMap.values()).map(t => t.ef));

  // Backward pass to calculate Latest Start (LS) and Latest Finish (LF)
  const taskIds = Array.from(tasksMap.keys()).reverse(); // Process in reverse
  for (const taskId of taskIds) {
    const task = tasksMap.get(taskId);
    if (task.successors.length === 0) {
      task.lf = projectCompletionTime;
    } else {
      task.lf = Math.min(...task.successors.map(succId => tasksMap.get(succId).ls || Infinity));
    }
    task.ls = task.lf - task.duration;
  }

  // Calculate slack and identify critical path
  const criticalPathTasks = [];
  for (const task of tasksMap.values()) {
    task.slack = task.lf - task.ef;
    // Tasks with zero (or near-zero) slack are on the critical path
    if (task.slack <= 0.001) {
      criticalPathTasks.push(task);
    }
  }

  // Sort the critical path tasks by their start date
  criticalPathTasks.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

  logger.info(`Found ${criticalPathTasks.length} tasks on the critical path for project version ID: ${id}.`);
  res.status(200).send(criticalPathTasks);
});

// Get tasks with slack (i.e., not on the critical path)
exports.getNonCriticalTasks = catchAsync(async (req, res) => {
  const { id } = req.params;
  logger.info(`Calculating non-critical tasks for project version ID: ${id}`);

  const tasks = await db.task.findAll({
    where: { projectVersionId: id, isDeleted: { [db.Sequelize.Op.ne]: true } },
    raw: true,
  });

  if (tasks.length === 0) {
    return res.status(200).send([]);
  }

  const tasksMap = new Map(tasks.map(task => [task.id, { ...task, duration: calculateDuration(task.startDate, task.endDate), successors: [], predecessors: task.predecessor || [] }]));

  // Build the graph
  for (const task of tasksMap.values()) {
    if (task.predecessor) {
      for (const predId of task.predecessor) {
        if (tasksMap.has(predId)) {
          tasksMap.get(predId).successors.push(task.id);
        }
      }
    }
  }

  // Forward pass
  for (const task of tasksMap.values()) {
    task.es = (task.predecessors.length === 0) ? 0 : Math.max(...task.predecessors.map(predId => tasksMap.get(predId).ef || 0));
    task.ef = task.es + task.duration;
  }

  const projectCompletionTime = Math.max(...Array.from(tasksMap.values()).map(t => t.ef));

  // Backward pass
  const taskIds = Array.from(tasksMap.keys()).reverse();
  for (const taskId of taskIds) {
    const task = tasksMap.get(taskId);
    task.lf = (task.successors.length === 0) ? projectCompletionTime : Math.min(...task.successors.map(succId => tasksMap.get(succId).ls || Infinity));
    task.ls = task.lf - task.duration;
  }

  // Calculate slack and identify non-critical tasks
  const nonCriticalTasks = Array.from(tasksMap.values()).filter(task => (task.lf - task.ef) > 0.001);

  nonCriticalTasks.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

  logger.info(`Found ${nonCriticalTasks.length} non-critical tasks for project version ID: ${id}.`);
  res.status(200).send(nonCriticalTasks);
});

// Clone a project version to create a new revision
exports.clone = catchAsync(async (req, res) => {
  const sourceVersionId = req.params.id;
  const { newVersionName } = req.body;
  const t = await db.sequelize.transaction();

  try {
    // 1. Find the source version with all its phases and tasks
    const sourceVersion = await db.projectverison.findByPk(sourceVersionId, {
      include: [{ model: db.phase }, { model: db.task }],
      transaction: t,
    });

    if (!sourceVersion) {
      await t.rollback();
      return res.status(404).send({ message: 'Source project version not found.' });
    }

    // 2. Create the new project version
    const newVersion = await db.projectverison.create({
      version_name: newVersionName,
      projectId: sourceVersion.projectId,
      // Copy other relevant fields from sourceVersion if necessary
    }, { transaction: t });

    const oldToNewPhaseIdMap = new Map();
    const oldToNewTaskIdMap = new Map();

    // 3. Clone phases
    for (const phase of sourceVersion.phases) {
      const newPhase = await db.phase.create({
        name: phase.name,
        startDate: phase.startDate,
        endDate: phase.endDate,
        projectVersionId: newVersion.id,
      }, { transaction: t });
      oldToNewPhaseIdMap.set(phase.id, newPhase.id);
    }

    // 4. Clone tasks and map their old IDs to new IDs
    for (const task of sourceVersion.tasks) {
      const newTaskData = { ...task.get({ plain: true }) };
      delete newTaskData.id;
      delete newTaskData.created_at;
      delete newTaskData.updated_at;
      newTaskData.projectVersionId = newVersion.id;
      newTaskData.phaseId = oldToNewPhaseIdMap.get(task.phaseId) || null;
      newTaskData.status = 'not-started'; // Reset status for the new plan
      newTaskData.progress = 0;
      newTaskData.completedAt = null;

      const newTask = await db.task.create(newTaskData, { transaction: t });
      oldToNewTaskIdMap.set(task.id, newTask.id);
    }

    // 5. Re-map predecessor/successor relationships for the new tasks
    for (const task of sourceVersion.tasks) {
      const newTask = await db.task.findByPk(oldToNewTaskIdMap.get(task.id), { transaction: t });
      const newPredecessors = (task.predecessor || []).map(oldId => oldToNewTaskIdMap.get(oldId)).filter(Boolean);
      const newSuccessors = (task.successor || []).map(oldId => oldToNewTaskIdMap.get(oldId)).filter(Boolean);

      await newTask.update({
        predecessor: newPredecessors,
        successor: newSuccessors,
      }, { transaction: t });
    }

    await t.commit();

    logger.info(`Successfully cloned project version ID ${sourceVersionId} to new version ID ${newVersion.id} ('${newVersionName}')`);
    res.status(201).send({
      message: 'Project version cloned successfully.',
      newProjectVersion: newVersion,
    });

  } catch (error) {
    await t.rollback();
    throw error;
  }
});

// Compare two project versions
exports.compareVersions = catchAsync(async (req, res) => {
  const { sourceVersionId, targetVersionId } = req.params;
  logger.info(`Comparing project version ID ${sourceVersionId} with ${targetVersionId}.`);

  // 1. Fetch all tasks for both versions
  const sourceTasks = await db.task.findAll({ where: { projectVersionId: sourceVersionId }, raw: true });
  const targetTasks = await db.task.findAll({ where: { projectVersionId: targetVersionId }, raw: true });

  const sourceTasksMap = new Map(sourceTasks.map(t => [t.id, t]));
  const targetTasksMap = new Map(targetTasks.map(t => [t.clonedFromTaskId, t]));

  const added = [];
  const deleted = [];
  const modified = [];

  // 2. Identify deleted and modified tasks
  for (const sourceTask of sourceTasks) {
    const correspondingTargetTask = targetTasksMap.get(sourceTask.id);
    if (correspondingTargetTask) {
      // Task exists in both, check for modifications
      const changes = {};
      const fieldsToCompare = ['name', 'startDate', 'endDate', 'effort', 'status'];
      fieldsToCompare.forEach(field => {
        // Use moment to compare dates properly
        if (field.includes('Date')) {
          if (!moment(sourceTask[field]).isSame(correspondingTargetTask[field])) {
            changes[field] = { from: sourceTask[field], to: correspondingTargetTask[field] };
          }
        } else if (sourceTask[field] !== correspondingTargetTask[field]) {
          changes[field] = { from: sourceTask[field], to: correspondingTargetTask[field] };
        }
      });

      if (Object.keys(changes).length > 0) {
        modified.push({
          sourceTask: sourceTask,
          targetTask: correspondingTargetTask,
          changes,
        });
      }
    } else {
      // Task exists in source but not in target, so it was deleted
      deleted.push(sourceTask);
    }
  }

  // 3. Identify added tasks
  for (const targetTask of targetTasks) {
    if (!targetTask.clonedFromTaskId || !sourceTasksMap.has(targetTask.clonedFromTaskId)) {
      // Task exists in target but has no link to the source version
      added.push(targetTask);
    }
  }

  const comparison = { added, deleted, modified };

  logger.info(`Comparison complete for versions ${sourceVersionId} and ${targetVersionId}: ${added.length} added, ${deleted.length} deleted, ${modified.length} modified.`);
  res.status(200).send(comparison);
});

// Get a summary of slack for each phase
exports.getPhaseSlackSummary = catchAsync(async (req, res) => {
  const { id } = req.params;
  logger.info(`Calculating phase slack summary for project version ID: ${id}`);

  const tasks = await db.task.findAll({
    where: { projectVersionId: id, isDeleted: { [db.Sequelize.Op.ne]: true } },
    include: [{ model: db.phase, attributes: ['name'] }],
  });

  if (tasks.length === 0) {
    return res.status(200).send([]);
  }

  const tasksMap = new Map(tasks.map(task => [task.id, { ...task.get({ plain: true }), duration: calculateDuration(task.startDate, task.endDate), successors: [], predecessors: task.predecessor || [] }]));

  // Build the graph
  for (const task of tasksMap.values()) {
    if (task.predecessor) {
      for (const predId of task.predecessor) {
        if (tasksMap.has(predId)) {
          tasksMap.get(predId).successors.push(task.id);
        }
      }
    }
  }

  // Forward pass
  for (const task of tasksMap.values()) {
    task.es = (task.predecessors.length === 0) ? 0 : Math.max(...task.predecessors.map(predId => tasksMap.get(predId).ef || 0));
    task.ef = task.es + task.duration;
  }

  const projectCompletionTime = Math.max(...Array.from(tasksMap.values()).map(t => t.ef));

  // Backward pass
  const taskIds = Array.from(tasksMap.keys()).reverse();
  for (const taskId of taskIds) {
    const task = tasksMap.get(taskId);
    task.lf = (task.successors.length === 0) ? projectCompletionTime : Math.min(...task.successors.map(succId => tasksMap.get(succId).ls || Infinity));
    task.ls = task.lf - task.duration;
    task.slack = task.lf - task.ef;
  }

  // Group slack by phase
  const phaseSlacks = {};
  for (const task of tasksMap.values()) {
    if (task.phaseId) {
      if (!phaseSlacks[task.phaseId]) {
        phaseSlacks[task.phaseId] = { phaseName: task.phase.name, slacks: [] };
      }
      phaseSlacks[task.phaseId].slacks.push(task.slack);
    }
  }

  // Calculate summary statistics
  const summary = Object.entries(phaseSlacks).map(([phaseId, data]) => ({
    phaseId: parseInt(phaseId),
    phaseName: data.phaseName,
    minSlack: Math.min(...data.slacks),
    maxSlack: Math.max(...data.slacks),
    averageSlack: parseFloat((data.slacks.reduce((a, b) => a + b, 0) / data.slacks.length).toFixed(2)),
  }));

  logger.info(`Generated phase slack summary for project version ID: ${id}.`);
  res.status(200).send(summary);
});