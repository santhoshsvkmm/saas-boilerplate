var express = require('express');
var router = express.Router();

const withAuth = require('../middleware/withAuth.middleware.js');
const { cacheMiddleware } = require("../middleware/cache.middleware.js");
const validate = require('../middleware/validate.middleware.js');
const { createConsultant, updateConsultant } = require('../validationSchemas/consultant.validation.js');

const consultant = require("../controllers/consultant.controller.js");

// Create a new Consultant
router.post('/', withAuth.verifyToken, withAuth.withRoleAdminOrManager, validate(createConsultant), consultant.create);

// Retrieve all Consultants
router.get('/', withAuth.verifyToken, withAuth.withRoleAdminOrManager, cacheMiddleware('consultants'), consultant.findAll);

// Retrieve all Consultants for an Organisation
router.get('/organisation/:id', withAuth.verifyToken, withAuth.withRoleAdminOrManager, cacheMiddleware('consultants'), consultant.findAllByOrganisation);

// Retrieve a single Consultant with an id
router.get('/:id', withAuth.verifyToken, withAuth.withRoleAdminOrManager, consultant.findOne);

// Update a Consultant with an id
router.put('/:id', withAuth.verifyToken, withAuth.withRoleAdminOrManager, validate(updateConsultant), consultant.update);

// Delete a Consultant with an id
router.delete('/:id', withAuth.verifyToken, withAuth.withRoleAdmin, consultant.delete);

// Delete all Consultants for an Organisation
router.delete('/organisation/:id', withAuth.verifyToken, withAuth.withRoleAdmin, consultant.deleteAllByOrganisation);

module.exports = router;