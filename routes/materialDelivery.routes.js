var express = require('express');
var router = express.Router();

const withAuth = require('../middleware/withAuth.middleware.js');
const { cacheMiddleware } = require("../middleware/cache.middleware.js");
const validate = require('../middleware/validate.middleware.js');
const { createDelivery, updateDelivery } = require('../validationSchemas/materialDelivery.validation.js');

const delivery = require("../controllers/materialDelivery.controller.js");

// Create a new Material Delivery
router.post('/', withAuth.verifyToken, withAuth.withRoleAdminOrManager, validate(createDelivery), delivery.create);

// Retrieve all Material Deliveries
router.get('/', withAuth.verifyToken, withAuth.withRoleAdminOrManager, cacheMiddleware('deliveries'), delivery.findAll);

// Retrieve all Deliveries for a specific Purchase Order
router.get('/purchase-order/:id', withAuth.verifyToken, withAuth.withRoleAdminOrManager, (req, res, next) => cacheMiddleware(`purchase-order-deliveries:${req.params.id}`)(req, res, next), delivery.findAllByPurchaseOrder);

// Retrieve a single Material Delivery with an id
router.get('/:id', withAuth.verifyToken, withAuth.withRoleAdminOrManager, delivery.findOne);

// Update a Material Delivery with an id
router.put('/:id', withAuth.verifyToken, withAuth.withRoleAdminOrManager, validate(updateDelivery), delivery.update);

// Delete a Material Delivery with an id
router.delete('/:id', withAuth.verifyToken, withAuth.withRoleAdmin, delivery.delete);

module.exports = router;