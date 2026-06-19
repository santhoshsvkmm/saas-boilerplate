const db = require("../models");
const MaterialDelivery = db.materialDelivery;
const Op = db.Sequelize.Op;
const catchAsync = require("../utils/catchAsync");
const logger = require('../loggers/logger');
const { clearCacheByTag } = require('../utils/cache.util');
const sendEmail = require('../services/email.services');

// Create and Save a new Material Delivery
exports.create = catchAsync(async (req, res) => {
  const { material_purchase_order_id, ActualQuantity } = req.body;
  const t = await db.sequelize.transaction();

  try {
    // 1. Create the delivery record
    const delivery = await MaterialDelivery.create(req.body, { transaction: t });

    // 2. Find the purchase order to get the material ID
    const purchaseOrder = await db.materialPurchaseOrder.findByPk(material_purchase_order_id, { transaction: t });
    if (!purchaseOrder) {
      await t.rollback();
      return res.status(404).send({ message: 'Associated Purchase Order not found.' });
    }

    const material = await db.material.findByPk(purchaseOrder.material_id, { transaction: t });
    if (!material) {
      await t.rollback();
      return res.status(404).send({ message: 'Material not found.' });
    }
    const stockBeforeUpdate = parseFloat(material.quantity_in_stock);

    // 3. Increment the material's stock quantity
    await db.material.increment('quantity_in_stock', {
      by: ActualQuantity,
      where: { id: purchaseOrder.material_id },
      transaction: t,
    });

    const stockAfterUpdate = stockBeforeUpdate + parseFloat(ActualQuantity);

    // 4. Create a stock history record
    await db.materialStockHistory.create({
      material_id: purchaseOrder.material_id,
      change_quantity: ActualQuantity,
      new_quantity: stockAfterUpdate,
      reason: 'delivery_received',
      related_entity_id: delivery.id,
    }, { transaction: t });

    // 4. Calculate total delivered quantity and update PO status
    const allDeliveries = await MaterialDelivery.findAll({
      where: { material_purchase_order_id: material_purchase_order_id },
      transaction: t,
    });

    const totalDelivered = allDeliveries.reduce((sum, d) => sum + parseFloat(d.ActualQuantity), 0);

    let newStatus = 'partially_delivered';
    if (totalDelivered >= parseFloat(purchaseOrder.OrderedQuantity)) {
      newStatus = 'fully_delivered';
    }

    await db.materialPurchaseOrder.update(
      { status: newStatus },
      { where: { id: material_purchase_order_id }, transaction: t }
    );

    await t.commit();

    logger.info(`Material Delivery created successfully with ID: ${delivery.id}. Stock updated for material ID: ${purchaseOrder.material_id}`);
    await clearCacheByTag('deliveries');
    await clearCacheByTag(`purchase-order-deliveries:${delivery.material_purchase_order_id}`);
    await clearCacheByTag('materials'); // Also clear general materials cache as stock has changed
    await clearCacheByTag('inventory-summary');
    await clearCacheByTag('materials-reorder-needed'); // Clear the reorder report cache
    await clearCacheByTag('purchase-orders-open');
    await clearCacheByTag('purchase-orders'); // Clear PO list cache as status has changed

    res.status(201).send(delivery);
  } catch (error) {
    await t.rollback();
    throw error; // Pass error to the centralized error handler
  }
});

// Retrieve all Material Deliveries from the database.
exports.findAll = catchAsync(async (req, res) => {
  logger.info('Retrieving all material deliveries.');
  const data = await MaterialDelivery.findAll({
    where: { isDeleted: { [Op.ne]: true } }
  });
  res.send(data);
});

// Find a single Material Delivery with an id
exports.findOne = catchAsync(async (req, res) => {
  const id = req.params.id;
  logger.info(`Retrieving material delivery with ID: ${id}`);
  const data = await MaterialDelivery.findOne({
    where: { id: id, isDeleted: { [Op.ne]: true } }
  });
  res.send(data);
});

// Retrieve all Deliveries for a specific Purchase Order
exports.findAllByPurchaseOrder = catchAsync(async (req, res) => {
  const purchaseOrderId = req.params.id;
  logger.info(`Retrieving all deliveries for purchase order ID: ${purchaseOrderId}`);
  const data = await MaterialDelivery.findAll({
    where: { material_purchase_order_id: purchaseOrderId, isDeleted: { [Op.ne]: true } }
  });
  res.send(data);
});

// Update a Material Delivery by the id in the request
exports.update = catchAsync(async (req, res) => {
  const id = req.params.id;
  logger.info(`Attempting to update material delivery with ID: ${id}`);

  const delivery = await MaterialDelivery.findByPk(id);
  if (!delivery) {
    return res.status(404).send({ message: `Cannot find Delivery with id=${id}.` });
  }

  const [num] = await MaterialDelivery.update(req.body, {
    where: { id: id }
  });

  if (num == 1) {
    logger.info(`Material Delivery updated successfully with ID: ${id}`);
    await clearCacheByTag('deliveries');
    if (delivery.material_purchase_order_id) {
      await clearCacheByTag(`purchase-order-deliveries:${delivery.material_purchase_order_id}`);
    }
    res.send({
      message: "Material Delivery was updated successfully."
    });
  } else {
    res.send({
      message: `Cannot update Material Delivery with id=${id}. Maybe it was not found or req.body is empty!`
    });
  }
});

// Delete a Material Delivery with the specified id in the request
exports.delete = catchAsync(async (req, res) => {
  const id = req.params.id;
  logger.info(`Attempting to soft-delete material delivery with ID: ${id}`);

  const delivery = await MaterialDelivery.findByPk(id);
  if (!delivery) {
    return res.status(404).send({ message: `Cannot find Delivery with id=${id}.` });
  }

  const [num] = await MaterialDelivery.update({ isDeleted: true }, {
    where: { id: id }
  });

  if (num == 1) {
    logger.info(`Material Delivery soft-deleted successfully with ID: ${id}`);
    await clearCacheByTag('deliveries');
    if (delivery.material_purchase_order_id) {
      await clearCacheByTag(`purchase-order-deliveries:${delivery.material_purchase_order_id}`);
    }
    res.send({
      message: "Material Delivery was deleted successfully!"
    });
  } else {
    res.send({
      message: `Cannot delete Material Delivery with id=${id}.`
    });
  }
});