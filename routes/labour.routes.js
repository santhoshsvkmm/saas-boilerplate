var express = require('express');
var router = express.Router();

const withAuth = require('../middleware/withAuth.middleware.js');
const { cacheMiddleware } = require("../middleware/cache.middleware.js");
const validate = require('../middleware/validate.middleware.js');
const { createLabour, updateLabour, getLabourerHoursSummary, getLabourerProjects } = require('../validationSchemas/labour.validation.js');

const labour = require("../controllers/labour.controller.js");

// Create a new Labourer
router.post('/', withAuth.verifyToken, withAuth.withRoleAdminOrManager, validate(createLabour), labour.create);

// Retrieve all Labourers
router.get('/', withAuth.verifyToken, withAuth.withRoleAdminOrManager, cacheMiddleware('labours'), labour.findAll);

// Retrieve all Labourers for an Organisation
router.get('/organisation/:id', withAuth.verifyToken, withAuth.withRoleAdminOrManager, cacheMiddleware('labours'), labour.findAllByOrganisation);

// Retrieve all Labourers for a Subcontractor
router.get('/subcontractor/:id', withAuth.verifyToken, withAuth.withRoleAdminOrManager, cacheMiddleware('labours'), labour.findAllBySubcontractor);

// Retrieve a single Labourer with an id
router.get('/:id', withAuth.verifyToken, withAuth.withRoleAdminOrManager, labour.findOne);

// Retrieve all Tasks for a specific Labourer
router.get('/:id/tasks', withAuth.verifyToken, withAuth.withRoleAdminOrManager, (req, res, next) => cacheMiddleware(`labourer-tasks:${req.params.id}`)(req, res, next), labour.getTasks);

// Retrieve all Projects a specific Labourer has worked on
router.get('/:id/projects', withAuth.verifyToken, withAuth.withRoleAdminOrManager, validate(getLabourerProjects), (req, res, next) => cacheMiddleware(`labourer-projects:${req.params.id}`)(req, res, next), labour.getProjects);

// Retrieve a summary of total hours for a specific Labourer
router.get('/:id/hours-summary', withAuth.verifyToken, withAuth.withRoleAdminOrManager, (req, res, next) => cacheMiddleware(`labourer-hours-summary:${req.params.id}`)(req, res, next), validate(getLabourerHoursSummary), labour.getHoursSummary);

// Update a Labourer with an id
router.put('/:id', withAuth.verifyToken, withAuth.withRoleAdminOrManager, validate(updateLabour), labour.update);

// Delete a Labourer with an id
router.delete('/:id', withAuth.verifyToken, withAuth.withRoleAdmin, labour.delete);

// Delete all Labourers for an Organisation
router.delete('/organisation/:id', withAuth.verifyToken, withAuth.withRoleAdmin, labour.deleteAllByOrganisation);

module.exports = router;