var express = require('express');
var router = express.Router();

const withAuth = require('../middleware/withAuth.middleware.js');
const validate = require('../middleware/validate.middleware.js');
const { cacheMiddleware } = require('../middleware/cache.middleware.js');
const { createLookahead, addTasksToLookahead, getLookaheads, updateLookahead, getProgressSummary, removeTaskFromLookahead, findUnplannedTasks, getBurndownSummary, getVelocitySummary, getBehindScheduleLookaheads, getAtRiskLookaheads, getBlockedLookaheads, getProjectedEarlyLookaheads, moveTask } = require('../validationSchemas/lookahead.validation.js');

const lookahead = require("../controllers/lookahead.controller.js");

// Create a new Lookahead (Sprint)
router.post('/', withAuth.verifyToken, withAuth.withRoleAdminOrManager, validate(createLookahead), lookahead.create);

// Get all Lookahead plans for a specific project version
router.get('/project-version/:projectVersionId', withAuth.verifyToken, withAuth.withRoleAdminOrManager, validate(getLookaheads), (req, res, next) => cacheMiddleware(`lookaheads-for-version:${req.params.projectVersionId}`)(req, res, next), lookahead.findAllForProjectVersion);

// Get all unplanned tasks for a specific project version
router.get('/project-version/:projectVersionId/unplanned-tasks', withAuth.verifyToken, withAuth.withRoleAdminOrManager, validate(findUnplannedTasks), (req, res, next) => cacheMiddleware(`unplanned-tasks-for-version:${req.params.projectVersionId}`)(req, res, next), lookahead.findUnplannedTasks);

// Get a velocity summary for a project version
router.get('/project-version/:projectVersionId/velocity-summary', withAuth.verifyToken, withAuth.withRoleAdminOrManager, validate(getVelocitySummary), (req, res, next) => cacheMiddleware(`velocity-summary-for-version:${req.params.projectVersionId}`)(req, res, next), lookahead.getVelocitySummary);

// Get all active Lookahead plans
router.get('/active', withAuth.verifyToken, withAuth.withRoleAdminOrManager, cacheMiddleware('lookaheads-active'), lookahead.findAllActive);

// Get all Lookahead plans that are behind schedule
router.get('/behind-schedule', withAuth.verifyToken, withAuth.withRoleAdminOrManager, validate(getBehindScheduleLookaheads), cacheMiddleware('lookaheads-behind-schedule'), lookahead.findAllBehindSchedule);

// Get all Lookahead plans that are at risk of not finishing on time
router.get('/at-risk', withAuth.verifyToken, withAuth.withRoleAdminOrManager, validate(getAtRiskLookaheads), cacheMiddleware('lookaheads-at-risk'), lookahead.findAllAtRisk);

// Get all Lookahead plans that are blocked
router.get('/blocked', withAuth.verifyToken, withAuth.withRoleAdminOrManager, validate(getBlockedLookaheads), cacheMiddleware('lookaheads-blocked'), lookahead.findAllBlocked);

// Get all Lookahead plans that are projected to finish early
router.get('/projected-early', withAuth.verifyToken, withAuth.withRoleAdminOrManager, validate(getProjectedEarlyLookaheads), cacheMiddleware('lookaheads-projected-early'), lookahead.findAllProjectedEarly);

// Get details for a single Lookahead plan (including tasks)
router.get('/:id', withAuth.verifyToken, withAuth.withRoleAdminOrManager, (req, res, next) => cacheMiddleware(`lookahead-details:${req.params.id}`)(req, res, next), lookahead.getDetails);

// Get a progress summary for a single Lookahead plan
router.get('/:id/progress-summary', withAuth.verifyToken, withAuth.withRoleAdminOrManager, validate(getProgressSummary), (req, res, next) => cacheMiddleware(`lookahead-progress-summary:${req.params.id}`)(req, res, next), lookahead.getProgressSummary);

// Get a burndown chart summary for a single Lookahead plan
router.get('/:id/burndown-summary', withAuth.verifyToken, withAuth.withRoleAdminOrManager, validate(getBurndownSummary), (req, res, next) => cacheMiddleware(`lookahead-burndown-summary:${req.params.id}`)(req, res, next), lookahead.getBurndownSummary);

// Add tasks to a Lookahead plan
router.post('/:id/tasks', withAuth.verifyToken, withAuth.withRoleAdminOrManager, validate(addTasksToLookahead), lookahead.addTasks);

// Remove a task from a Lookahead plan
router.delete('/:id/tasks/:taskId', withAuth.verifyToken, withAuth.withRoleAdminOrManager, validate(removeTaskFromLookahead), lookahead.removeTask);

// Move a task from one Lookahead plan to another
router.post('/:fromLookaheadId/tasks/:taskId/move-to/:toLookaheadId', withAuth.verifyToken, withAuth.withRoleAdminOrManager, validate(moveTask), lookahead.moveTask);

// Update a Lookahead plan
router.put('/:id', withAuth.verifyToken, withAuth.withRoleAdminOrManager, validate(updateLookahead), lookahead.update);

module.exports = router;