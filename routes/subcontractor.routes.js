var express = require('express');
var router = express.Router();

const withAuth = require('../middleware/withAuth.middleware.js');
const { cacheMiddleware } = require("../middleware/cache.middleware.js");
const validate = require('../middleware/validate.middleware.js');
const { createSubcontractor, updateSubcontractor } = require('../validationSchemas/subcontractor.validation.js');

const subcontractor = require("../controllers/subcontractor.controller.js");

// Create a new Subcontractor
router.post('/', withAuth.verifyToken, withAuth.withRoleAdminOrManager, validate(createSubcontractor), subcontractor.create);

// Retrieve all Subcontractors
router.get('/', withAuth.verifyToken, withAuth.withRoleAdminOrManager, cacheMiddleware('subcontractors'), subcontractor.findAll);

// Retrieve all Subcontractors for an Organisation
router.get('/organisation/:id', withAuth.verifyToken, withAuth.withRoleAdminOrManager, cacheMiddleware('subcontractors'), subcontractor.findAllByOrganisation);

// Retrieve a single Subcontractor with an id
router.get('/:id', withAuth.verifyToken, withAuth.withRoleAdminOrManager, subcontractor.findOne);

// Update a Subcontractor with an id
router.put('/:id', withAuth.verifyToken, withAuth.withRoleAdminOrManager, validate(updateSubcontractor), subcontractor.update);

// Delete a Subcontractor with an id
router.delete('/:id', withAuth.verifyToken, withAuth.withRoleAdmin, subcontractor.delete);

// Delete all Subcontractors for an Organisation
router.delete('/organisation/:id', withAuth.verifyToken, withAuth.withRoleAdmin, subcontractor.deleteAllByOrganisation);

module.exports = router;