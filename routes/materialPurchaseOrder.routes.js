var express = require('express');
var router = express.Router();

const withAuth = require('../middleware/withAuth.middleware.js');
const { cacheMiddleware } = require("../middleware/cache.middleware.js");
const validate = require('../middleware/validate.middleware.js');
const { createPurchaseOrder, updatePurchaseOrder } = require('../validationSchemas/materialPurchaseOrder.validation.js');

const purchaseOrder = require("../controllers/materialPurchaseOrder.controller.js");

// Create a new Material Purchase Order
router.post('/', withAuth.verifyToken, withAuth.withRoleAdminOrManager, validate(createPurchaseOrder), purchaseOrder.create);

// Retrieve all Material Purchase Orders
router.get('/', withAuth.verifyToken, withAuth.withRoleAdminOrManager, cacheMiddleware('purchase-orders'), purchaseOrder.findAll);

// Retrieve all open (not fully delivered) Material Purchase Orders
router.get('/open', withAuth.verifyToken, withAuth.withRoleAdminOrManager, cacheMiddleware('purchase-orders-open'), purchaseOrder.findAllOpen);

// Retrieve all Purchase Orders for a specific Procurement Plan
router.get('/procurement-plan/:id', withAuth.verifyToken, withAuth.withRoleAdminOrManager, (req, res, next) => cacheMiddleware(`procurement-plan-pos:${req.params.id}`)(req, res, next), purchaseOrder.findAllByProcurementPlan);

// Retrieve a single Material Purchase Order with an id
router.get('/:id', withAuth.verifyToken, withAuth.withRoleAdminOrManager, purchaseOrder.findOne);

// Update a Material Purchase Order with an id
router.put('/:id', withAuth.verifyToken, withAuth.withRoleAdminOrManager, validate(updatePurchaseOrder), purchaseOrder.update);

// Delete a Material Purchase Order with an id
router.delete('/:id', withAuth.verifyToken, withAuth.withRoleAdmin, purchaseOrder.delete);

module.exports = router;