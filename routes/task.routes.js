var express = require('express');
var router = express.Router();

const withAuth = require('../middleware/withAuth.middleware.js');
const { cacheMiddleware } = require("../middleware/cache.middleware.js");
const validate = require('../middleware/validate.middleware.js');
const { createTask, updateTask, addLabourerToTask, removeLabourerFromTask, getLookaheadsForTask } = require('../validationSchemas/task.validation.js');
const task = require("../controllers/task.controller.js");

// Create a new Task
router.post('/', withAuth.verifyToken, withAuth.withRoleAdminOrManager, validate(createTask), task.create);

// Retrieve all Tasks
router.get('/', withAuth.verifyToken, withAuth.withRoleAdminOrManager, cacheMiddleware('tasks'), task.findAll);

// Retrieve all Tasks for a specific Project Version
router.get('/project-version/:id', withAuth.verifyToken, withAuth.withRoleAdminOrManager, (req, res, next) => cacheMiddleware(`project-version-tasks:${req.params.id}`)(req, res, next), task.findAllByProjectVersion);

// Retrieve all Tasks for a specific Phase
router.get('/phase/:id', withAuth.verifyToken, withAuth.withRoleAdminOrManager, (req, res, next) => cacheMiddleware(`phase-tasks:${req.params.id}`)(req, res, next), task.findAllByPhase);

// Retrieve a single Task with an id
router.get('/:id', withAuth.verifyToken, withAuth.withRoleAdminOrManager, task.findOne);

// Retrieve all Labourers for a specific Task
router.get('/:id/labourers', withAuth.verifyToken, withAuth.withRoleAdminOrManager, (req, res, next) => cacheMiddleware(`task-labourers:${req.params.id}`)(req, res, next), task.getLabourers);

// Retrieve all Lookaheads for a specific Task
router.get('/:id/lookaheads', withAuth.verifyToken, withAuth.withRoleAdminOrManager, validate(getLookaheadsForTask), (req, res, next) => cacheMiddleware(`task-lookaheads:${req.params.id}`)(req, res, next), task.getLookaheads);

// Update a Task with an id
router.put('/:id', withAuth.verifyToken, withAuth.withRoleAdminOrManager, validate(updateTask), task.update);

// Delete a Task with an id
router.delete('/:id', withAuth.verifyToken, withAuth.withRoleAdmin, task.delete);

// Consume stock for a task
router.post('/:id/consume-stock', withAuth.verifyToken, withAuth.withRoleAdminOrManager, task.consumeStock);

// Associate a labourer with a task
router.post('/:id/labourers', withAuth.verifyToken, withAuth.withRoleAdminOrManager, validate(addLabourerToTask), task.addLabourer);

// Remove a labourer from a task
router.delete('/:id/labourers/:labourerId', withAuth.verifyToken, withAuth.withRoleAdminOrManager, validate(removeLabourerFromTask), task.removeLabourer);

module.exports = router;