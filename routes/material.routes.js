var express = require('express');
var router = express.Router();

const withAuth = require('../middleware/withAuth.middleware.js');
const { cacheMiddleware } = require("../middleware/cache.middleware.js");
const validate = require('../middleware/validate.middleware.js');
const { createMaterial, updateMaterial, adjustStock, revertStockAdjustment, getStockAdjustmentsSummary, getStockAdjustmentsByCategory } = require('../validationSchemas/material.validation.js');

const material = require("../controllers/material.controller.js");

// Create a new Material
router.post('/', withAuth.verifyToken, withAuth.withRoleAdminOrManager, validate(createMaterial), material.create);

// Retrieve all Materials
router.get('/', withAuth.verifyToken, withAuth.withRoleAdminOrManager, cacheMiddleware('materials'), material.findAll);

// Retrieve all Materials for a Project
router.get('/project/:id', withAuth.verifyToken, withAuth.withRoleAdminOrManager, cacheMiddleware('materials'), material.findAllByProject);

// Retrieve all Materials for an Organisation
router.get('/organisation/:id', withAuth.verifyToken, withAuth.withRoleAdminOrManager, cacheMiddleware('materials'), material.findAllByOrganisation);

// Download current inventory status as CSV
router.get('/download/inventory-status', withAuth.verifyToken, withAuth.withRoleAdminOrManager, material.downloadInventoryStatus);

// Retrieve all materials that are below their reorder level
router.get('/reorder-needed', withAuth.verifyToken, withAuth.withRoleAdminOrManager, cacheMiddleware('materials-reorder-needed'), material.findAllBelowReorderLevel);

// Retrieve a summary of key inventory metrics
router.get('/summary', withAuth.verifyToken, withAuth.withRoleAdminOrManager, cacheMiddleware('inventory-summary'), material.getInventorySummary);

// Retrieve the total inventory value grouped by category
router.get('/summary/by-category', withAuth.verifyToken, withAuth.withRoleAdminOrManager, cacheMiddleware('inventory-summary-by-category'), material.getInventoryValueByCategory);

// Retrieve a single Material with an id
router.get('/:id', withAuth.verifyToken, withAuth.withRoleAdminOrManager, material.findOne);

// Retrieve the stock history for a single Material
router.get('/:id/history', withAuth.verifyToken, withAuth.withRoleAdminOrManager, cacheMiddleware('material-history'), material.getStockHistory);

// Retrieve a summary of all stock adjustments for a specific material
router.get('/:id/adjustments', withAuth.verifyToken, withAuth.withRoleAdminOrManager, (req, res, next) => cacheMiddleware(`material-adjustments:${req.params.id}`)(req, res, next), material.getStockAdjustmentsByMaterial);

// Retrieve all stock adjustments made by a specific user
router.get('/adjustments/user/:id', withAuth.verifyToken, withAuth.withRoleAdminOrManager, (req, res, next) => cacheMiddleware(`user-adjustments:${req.params.id}`)(req, res, next), material.getStockAdjustmentsByUser);

// Retrieve a summary of all stock adjustments within a date range
router.get('/adjustments/summary', withAuth.verifyToken, withAuth.withRoleAdminOrManager, validate(getStockAdjustmentsSummary), cacheMiddleware('adjustments-summary'), material.getStockAdjustmentsSummary);

// Retrieve a summary of all stock adjustments for a specific material category
router.get('/adjustments/category/:category', withAuth.verifyToken, withAuth.withRoleAdminOrManager, validate(getStockAdjustmentsByCategory), (req, res, next) => cacheMiddleware(`adjustments-summary-by-category:${req.params.category}`)(req, res, next), material.getStockAdjustmentsByCategory);

// Update a Material with an id
router.put('/:id', withAuth.verifyToken, withAuth.withRoleAdminOrManager, validate(updateMaterial), material.update);

// Manually adjust stock for a material
router.post('/:id/adjust-stock', withAuth.verifyToken, withAuth.withRoleAdminOrManager, validate(adjustStock), material.adjustStock);

// Revert a manual stock adjustment
router.post('/adjustments/:historyId/revert', withAuth.verifyToken, withAuth.withRoleAdminOrManager, validate(revertStockAdjustment), material.revertStockAdjustment);

// Delete a Material with an id
router.delete('/:id', withAuth.verifyToken, withAuth.withRoleAdmin, material.delete);

// Delete all Materials for an Organisation
router.delete('/organisation/:id', withAuth.verifyToken, withAuth.withRoleAdmin, material.deleteAllByOrganisation);

module.exports = router;