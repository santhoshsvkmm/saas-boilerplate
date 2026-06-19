const db = require("../models");
const MaterialPurchaseOrder = db.materialPurchaseOrder;
const Op = db.Sequelize.Op;
const catchAsync = require("../utils/catchAsync");
const logger = require('../loggers/logger');
const { clearCacheByTag } = require('../utils/cache.util');

// Create and Save a new Material Purchase Order
exports.create = catchAsync(async (req, res) => {
  const data = await MaterialPurchaseOrder.create(req.body);
  logger.info(`Material Purchase Order created successfully with ID: ${data.id}`);
  await clearCacheByTag('purchase-orders');
  if (data.material_procurement_plan_id) {
    await clearCacheByTag(`procurement-plan-pos:${data.material_procurement_plan_id}`);
  }
  await clearCacheByTag('inventory-summary');
  res.status(201).send(data);
});

// Retrieve all Material Purchase Orders from the database.
exports.findAll = catchAsync(async (req, res) => {
  logger.info('Retrieving all material purchase orders.');
  const data = await MaterialPurchaseOrder.findAll({
    where: { isDeleted: { [Op.ne]: true } }
  });
  res.send(data);
});

// Retrieve all open Material Purchase Orders from the database.
exports.findAllOpen = catchAsync(async (req, res) => {
  logger.info('Retrieving all open material purchase orders.');
  const data = await MaterialPurchaseOrder.findAll({
    where: {
      status: { [Op.not]: 'fully_delivered' },
      isDeleted: { [Op.ne]: true }
    }
  });
  res.send(data);
});

// Find a single Material Purchase Order with an id
exports.findOne = catchAsync(async (req, res) => {
  const id = req.params.id;
  logger.info(`Retrieving material purchase order with ID: ${id}`);
  const data = await MaterialPurchaseOrder.findOne({
    where: { id: id, isDeleted: { [Op.ne]: true } }
  });
  res.send(data);
});

// Retrieve all Purchase Orders for a specific Procurement Plan
exports.findAllByProcurementPlan = catchAsync(async (req, res) => {
  const planId = req.params.id;
  logger.info(`Retrieving all purchase orders for procurement plan ID: ${planId}`);
  const data = await MaterialPurchaseOrder.findAll({
    where: { material_procurement_plan_id: planId, isDeleted: { [Op.ne]: true } }
  });
  res.send(data);
});

// Update a Material Purchase Order by the id in the request
exports.update = catchAsync(async (req, res) => {
  const id = req.params.id;
  logger.info(`Attempting to update material purchase order with ID: ${id}`);

  const purchaseOrder = await MaterialPurchaseOrder.findByPk(id);
  if (!purchaseOrder) {
    return res.status(404).send({ message: `Cannot find Purchase Order with id=${id}.` });
  }

  const [num] = await MaterialPurchaseOrder.update(req.body, {
    where: { id: id }
  });

  if (num == 1) {
    logger.info(`Material Purchase Order updated successfully with ID: ${id}`);
    await clearCacheByTag('purchase-orders');
    await clearCacheByTag('purchase-orders-open');
    await clearCacheByTag('inventory-summary');
    if (purchaseOrder.material_procurement_plan_id) {
      await clearCacheByTag(`procurement-plan-pos:${purchaseOrder.material_procurement_plan_id}`);
    }
    res.send({
      message: "Material Purchase Order was updated successfully."
    });
  } else {
    res.send({
      message: `Cannot update Material Purchase Order with id=${id}. Maybe it was not found or req.body is empty!`
    });
  }
});

// Delete a Material Purchase Order with the specified id in the request
exports.delete = catchAsync(async (req, res) => {
  const id = req.params.id;
  logger.info(`Attempting to soft-delete material purchase order with ID: ${id}`);

  const purchaseOrder = await MaterialPurchaseOrder.findByPk(id);
  if (!purchaseOrder) {
    return res.status(404).send({ message: `Cannot find Purchase Order with id=${id}.` });
  }

  const [num] = await MaterialPurchaseOrder.update({ isDeleted: true }, {
    where: { id: id }
  });

  if (num == 1) {
    logger.info(`Material Purchase Order soft-deleted successfully with ID: ${id}`);
    await clearCacheByTag('purchase-orders');
    await clearCacheByTag('purchase-orders-open');
    await clearCacheByTag('inventory-summary');
    if (purchaseOrder.material_procurement_plan_id) {
      await clearCacheByTag(`procurement-plan-pos:${purchaseOrder.material_procurement_plan_id}`);
    }
    res.send({
      message: "Material Purchase Order was deleted successfully!"
    });
  } else {
    res.send({
      message: `Cannot delete Material Purchase Order with id=${id}.`
    });
  }
});