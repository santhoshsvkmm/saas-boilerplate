var express = require('express');
var router = express.Router();

const withAuth = require('../middleware/withAuth.middleware.js');
const { cacheMiddleware } = require("../middleware/cache.middleware.js");
const validate = require('../middleware/validate.middleware.js');
const { createProcurementPlan, updateProcurementPlan } = require('../validationSchemas/materialProcurementPlan.validation.js');

const procurementPlan = require("../controllers/materialProcurementPlan.controller.js");

// Create a new Material Procurement Plan
router.post('/', withAuth.verifyToken, withAuth.withRoleAdminOrManager, validate(createProcurementPlan), procurementPlan.create);

// Retrieve all Material Procurement Plans
router.get('/', withAuth.verifyToken, withAuth.withRoleAdminOrManager, cacheMiddleware('procurement-plans'), procurementPlan.findAll);

// Retrieve all Procurement Plans for a specific Project
router.get('/project/:id', withAuth.verifyToken, withAuth.withRoleAdminOrManager, (req, res, next) => cacheMiddleware(`project-procurement-plans:${req.params.id}`)(req, res, next), procurementPlan.findAllByProject);

// Retrieve a single Material Procurement Plan with an id
router.get('/:id', withAuth.verifyToken, withAuth.withRoleAdminOrManager, procurementPlan.findOne);

// Update a Material Procurement Plan with an id
router.put('/:id', withAuth.verifyToken, withAuth.withRoleAdminOrManager, validate(updateProcurementPlan), procurementPlan.update);

// Delete a Material Procurement Plan with an id
router.delete('/:id', withAuth.verifyToken, withAuth.withRoleAdmin, procurementPlan.delete);

module.exports = router;