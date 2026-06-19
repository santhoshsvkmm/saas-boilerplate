var express = require('express');
var router = express.Router();

const withAuth = require('../middleware/withAuth.middleware.js');
const { cacheMiddleware } = require("../middleware/cache.middleware.js");
const validate = require('../middleware/validate.middleware.js');
const { createProject, updateProject, addConsultantToProject, generatePlan, getProjectHoursSummary, setActiveProjectVersion } = require('../validationSchemas/project.validation.js');

const project = require("../controllers/project.controller.js");

// Create a new Project
router.post('/', withAuth.verifyToken, withAuth.withRoleAdminOrManager, validate(createProject), project.create);

// Retrieve all Projects
router.get('/', withAuth.verifyToken, withAuth.withRoleAdminOrManager, cacheMiddleware('projects'), project.findAll);

// Retrieve all Projects for a User
router.get('/user/:id', withAuth.verifyToken, withAuth.withRoleAdminOrManager, cacheMiddleware('projects'), project.findAllByUser);

// Retrieve all Projects for an Organisation
router.get('/organisation/:id', withAuth.verifyToken, withAuth.withRoleAdminOrManager, cacheMiddleware('projects'), project.findAllByOrganisation);

// Retrieve a single Project with an id
router.get('/:id', withAuth.verifyToken, withAuth.withRoleAdminOrManager, project.findOne);

// Update a Project with an id
router.put('/:id', withAuth.verifyToken, withAuth.withRoleAdminOrManager, validate(updateProject), project.update);

// Delete a Project with an id
router.delete('/:id', withAuth.verifyToken, withAuth.withRoleAdmin, project.delete);

// Associate a consultant with a project
router.post('/:projectId/consultants', withAuth.verifyToken, withAuth.withRoleAdminOrManager, validate(addConsultantToProject), project.addConsultant);

// Get all consultants for a project
router.get('/:projectId/consultants', withAuth.verifyToken, withAuth.withRoleAdminOrManager, (req, res, next) => cacheMiddleware(`project-consultants:${req.params.projectId}`)(req, res, next), project.getConsultants);

// Get a summary of total hours assigned to a project
router.get('/:id/hours-summary', withAuth.verifyToken, withAuth.withRoleAdminOrManager, validate(getProjectHoursSummary), (req, res, next) => cacheMiddleware(`project-hours-summary:${req.params.id}`)(req, res, next), project.getHoursSummary);

// Generate a procurement plan from project tasks
router.post('/:projectId/generate-procurement-plan', withAuth.verifyToken, withAuth.withRoleAdminOrManager, validate(generatePlan), project.generateProcurementPlan);

// Set a specific project version as the active/baseline version for a project
router.put('/:projectId/set-active-version/:versionId', withAuth.verifyToken, withAuth.withRoleAdminOrManager, validate(setActiveProjectVersion), project.setActiveVersion);

module.exports = router;