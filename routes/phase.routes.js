var express = require('express');
var router = express.Router();

const withAuth = require('../middleware/withAuth.middleware.js');
const { cacheMiddleware } = require("../middleware/cache.middleware.js");
const validate = require('../middleware/validate.middleware.js');
const { createPhase, updatePhase } = require('../validationSchemas/phase.validation.js');

const phase = require("../controllers/phase.controller.js");

// Create a new Phase
router.post('/', withAuth.verifyToken, withAuth.withRoleAdminOrManager, validate(createPhase), phase.create);

// Retrieve all Phases
router.get('/', withAuth.verifyToken, withAuth.withRoleAdminOrManager, cacheMiddleware('phases'), phase.findAll);

// Retrieve all Phases for a specific Project Version
router.get('/project-version/:id', withAuth.verifyToken, withAuth.withRoleAdminOrManager, (req, res, next) => cacheMiddleware(`project-version-phases:${req.params.id}`)(req, res, next), phase.findAllByProjectVersion);

// Retrieve a single Phase with an id
router.get('/:id', withAuth.verifyToken, withAuth.withRoleAdminOrManager, phase.findOne);

// Update a Phase with an id
router.put('/:id', withAuth.verifyToken, withAuth.withRoleAdminOrManager, validate(updatePhase), phase.update);

// Delete a Phase with an id
router.delete('/:id', withAuth.verifyToken, withAuth.withRoleAdmin, phase.delete);

module.exports = router;