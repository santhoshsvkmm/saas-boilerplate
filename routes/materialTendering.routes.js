var express = require('express');
var router = express.Router();

const withAuth = require('../middleware/withAuth.middleware.js');
const { cacheMiddleware } = require("../middleware/cache.middleware.js");
const validate = require('../middleware/validate.middleware.js');
const { createTender, updateTender } = require('../validationSchemas/materialTendering.validation.js');

const tender = require("../controllers/materialTendering.controller.js");

// Create a new Material Tender
router.post('/', withAuth.verifyToken, withAuth.withRoleAdminOrManager, validate(createTender), tender.create);

// Retrieve all Material Tenders
router.get('/', withAuth.verifyToken, withAuth.withRoleAdminOrManager, cacheMiddleware('tenders'), tender.findAll);

// Retrieve all Tenders for an Organisation
router.get('/organisation/:id', withAuth.verifyToken, withAuth.withRoleAdminOrManager, cacheMiddleware('tenders'), tender.findAllByOrganisation);

// Retrieve a single Material Tender with an id (and its bids)
router.get('/:id', withAuth.verifyToken, withAuth.withRoleAdminOrManager, (req, res, next) => cacheMiddleware(`tender:${req.params.id}`)(req, res, next), tender.findOne);

// Update a Material Tender with an id
router.put('/:id', withAuth.verifyToken, withAuth.withRoleAdminOrManager, validate(updateTender), tender.update);

// Delete a Material Tender with an id
router.delete('/:id', withAuth.verifyToken, withAuth.withRoleAdmin, tender.delete);

module.exports = router;