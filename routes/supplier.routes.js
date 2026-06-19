var express = require('express');
var router = express.Router();

const withAuth = require('../middleware/withAuth.middleware.js');
const { cacheMiddleware } = require("../middleware/cache.middleware.js");
const validate = require('../middleware/validate.middleware.js');
const { createSupplier, updateSupplier } = require('../validationSchemas/supplier.validation.js');

const supplier = require("../controllers/supplier.controller.js");

// Create a new Supplier
router.post('/', withAuth.verifyToken, withAuth.withRoleAdminOrManager, validate(createSupplier), supplier.create);

// Retrieve all Suppliers
router.get('/', withAuth.verifyToken, withAuth.withRoleAdminOrManager, cacheMiddleware('suppliers'), supplier.findAll);

// Retrieve all Suppliers for an Organisation
router.get('/organisation/:id', withAuth.verifyToken, withAuth.withRoleAdminOrManager, cacheMiddleware('suppliers'), supplier.findAllByOrganisation);

// Retrieve a single Supplier with an id
router.get('/:id', withAuth.verifyToken, withAuth.withRoleAdminOrManager, supplier.findOne);

// Update a Supplier with an id
router.put('/:id', withAuth.verifyToken, withAuth.withRoleAdminOrManager, validate(updateSupplier), supplier.update);

// Delete a Supplier with an id
router.delete('/:id', withAuth.verifyToken, withAuth.withRoleAdmin, supplier.delete);

// Delete all Suppliers for an Organisation
router.delete('/organisation/:id', withAuth.verifyToken, withAuth.withRoleAdmin, supplier.deleteAllByOrganisation);

module.exports = router;