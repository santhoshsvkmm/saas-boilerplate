const db = require("../models");
const Material = db.material;
const Op = db.Sequelize.Op;
const catchAsync = require("../utils/catchAsync");
const logger = require('../loggers/logger');
const { clearCacheByTag } = require('../utils/cache.util');
const { Parser } = require('json2csv');

// Create and Save a new Material
exports.create = catchAsync(async (req, res) => {
  const data = await Material.create(req.body);
  logger.info(`Material created successfully with ID: ${data.id}`);
  await clearCacheByTag('materials');
  res.status(201).send(data);
});

// Retrieve all Materials from the database.
exports.findAll = catchAsync(async (req, res) => {
  logger.info('Retrieving all materials.');
  const data = await Material.findAll({
    where: { isDeleted: { [Op.ne]: true } }
  });
  res.send(data);
});

// Find a single Material with an id
exports.findOne = catchAsync(async (req, res) => {
  const id = req.params.id;
  logger.info(`Retrieving material with ID: ${id}`);
  const data = await Material.findOne({
    where: { id: id, isDeleted: { [Op.ne]: true } }
  });
  res.send(data);
});

// Retrieve all Materials for a specific Project
exports.findAllByProject = catchAsync(async (req, res) => {
  const projectId = req.params.id;
  logger.info(`Retrieving all materials for project ID: ${projectId}`);
  const data = await Material.findAll({
    where: { project_id: projectId, isDeleted: { [Op.ne]: true } }
  });
  res.send(data);
});

// Retrieve all Materials for a specific Organisation
exports.findAllByOrganisation = catchAsync(async (req, res) => {
  const organisationId = req.params.id;
  logger.info(`Retrieving all materials for organisation ID: ${organisationId}`);
  const data = await Material.findAll({
    where: { organisation_id: organisationId, isDeleted: { [Op.ne]: true } }
  });
  res.send(data);
});

// Retrieve all materials that are below their reorder level.
exports.findAllBelowReorderLevel = catchAsync(async (req, res) => {
  logger.info('Retrieving all materials below reorder level.');
  const data = await Material.findAll({
    where: {
      quantity_in_stock: {
        [Op.lt]: db.Sequelize.col('reorder_level')
      },
      isDeleted: { [Op.ne]: true }
    }
  });
  res.send(data);
});

// Get the total inventory value grouped by category.
exports.getInventoryValueByCategory = catchAsync(async (req, res) => {
  logger.info('Retrieving inventory value by category.');
  const data = await Material.findAll({
    attributes: [
      'category',
      [db.sequelize.fn('SUM', db.sequelize.literal('quantity_in_stock * unit_price')), 'totalValue']
    ],
    group: ['category'],
    where: { isDeleted: { [Op.ne]: true } },
    raw: true,
  });
  res.send(data);
});

// Get a summary of key inventory metrics.
exports.getInventorySummary = catchAsync(async (req, res) => {
  logger.info('Retrieving inventory summary.');

  const [totalMaterials, totalValueResult, lowStockItems, openPurchaseOrders] = await Promise.all([
    // 1. Total number of materials
    Material.count({ where: { isDeleted: { [Op.ne]: true } } }),

    // 2. Total inventory value
    Material.findOne({
      attributes: [[db.sequelize.fn('SUM', db.sequelize.literal('quantity_in_stock * unit_price')), 'totalValue']],
      where: { isDeleted: { [Op.ne]: true } },
      raw: true,
    }),

    // 3. Count of items below reorder level
    Material.count({
      where: {
        quantity_in_stock: { [Op.lt]: db.Sequelize.col('reorder_level') },
        isDeleted: { [Op.ne]: true },
      },
    }),

    // 4. Count of open purchase orders
    db.materialPurchaseOrder.count({ where: { status: { [Op.not]: 'fully_delivered' } } }),
  ]);

  res.send({ totalMaterials, totalInventoryValue: parseFloat(totalValueResult.totalValue) || 0, lowStockItems, openPurchaseOrders });
});

// Update a Material by the id in the request
exports.update = catchAsync(async (req, res) => {
  const id = req.params.id;
  logger.info(`Attempting to update material with ID: ${id}`);

  const [num] = await Material.update(req.body, {
    where: { id: id }
  });

  if (num == 1) {
    logger.info(`Material updated successfully with ID: ${id}`);
    await clearCacheByTag('materials');
    await clearCacheByTag('inventory-summary');
    res.send({
      message: "Material was updated successfully."
    });
  } else {
    res.send({
      message: `Cannot update Material with id=${id}. Maybe Material was not found or req.body is empty!`
    });
  }
});

// Delete a Material with the specified id in the request
exports.delete = catchAsync(async (req, res) => {
  const id = req.params.id;
  logger.info(`Attempting to soft-delete material with ID: ${id}`);

  const [num] = await Material.update({ isDeleted: true }, {
    where: { id: id }
  });

  if (num == 1) {
    logger.info(`Material soft-deleted successfully with ID: ${id}`);
    await clearCacheByTag('materials');
    await clearCacheByTag('inventory-summary');
    res.send({
      message: "Material was deleted successfully!"
    });
  } else {
    res.send({
      message: `Cannot delete Material with id=${id}. Maybe Material was not found!`
    });
  }
});

// Delete all Materials from the database.
exports.deleteAll = catchAsync(async (req, res) => {
  logger.warn('Attempting to soft-delete all materials.');
  const [nums] = await Material.update({ isDeleted: true }, {
    where: {},
  });
  await clearCacheByTag('materials');
  await clearCacheByTag('inventory-summary');
  logger.info(`${nums} materials were soft-deleted successfully.`);
  res.send({ message: `${nums} Materials were deleted successfully!` });
});

exports.deleteAllByOrganisation = catchAsync(async (req, res) => {
  const organisationId = req.params.id;
  logger.warn(`Attempting to soft-delete all materials for organisation ID: ${organisationId}`);
  const [nums] = await Material.update({ isDeleted: true }, {
    where: { organisation_id: organisationId },
  });
  await clearCacheByTag('materials');
  await clearCacheByTag('inventory-summary');
  logger.info(`${nums} materials for organisation ID ${organisationId} were soft-deleted successfully.`);
  res.send({ message: `${nums} Materials were deleted successfully!` });
});

// Get the stock level history for a specific material
exports.getStockHistory = catchAsync(async (req, res) => {
  const materialId = req.params.id;
  logger.info(`Retrieving stock history for material ID: ${materialId}`);
  const history = await db.materialStockHistory.findAll({
    where: { material_id: materialId },
    order: [['createdAt', 'DESC']],
  });

  res.send(history);
});

// Download current inventory status as CSV
exports.downloadInventoryStatus = catchAsync(async (req, res) => {
  logger.info('Generating inventory status CSV.');
  const materials = await Material.findAll({
    where: { isDeleted: { [Op.ne]: true } },
    order: [['name', 'ASC']],
    raw: true,
  });

  if (materials.length === 0) {
    return res.status(404).send({ message: 'No materials found in inventory.' });
  }

  const fields = [
    { label: 'Material ID', value: 'id' },
    { label: 'Name', value: 'name' },
    { label: 'Category', value: 'category' },
    { label: 'Quantity In Stock', value: 'quantity_in_stock' },
    { label: 'Unit', value: 'unit' },
    { label: 'Unit Price', value: 'unit_price' },
    { label: 'Reorder Level', value: 'reorder_level' },
  ];
  const json2csvParser = new Parser({ fields });
  const csv = json2csvParser.parse(materials);

  res.header('Content-Type', 'text/csv');
  res.attachment('inventory-status.csv');
  res.send(csv);
});

// Manually adjust stock for a specific material
exports.adjustStock = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { adjustmentQuantity, reason } = req.body;
  const t = await db.sequelize.transaction();

  try {
    const material = await Material.findByPk(id, { transaction: t });
    if (!material) {
      await t.rollback();
      return res.status(404).send({ message: 'Material not found.' });
    }

    const newStock = parseFloat(material.quantity_in_stock) + parseFloat(adjustmentQuantity);

    if (newStock < 0) {
      await t.rollback();
      return res.status(400).send({ message: 'Stock adjustment would result in a negative inventory.' });
    }

    // Update stock and create history record
    await material.update({ quantity_in_stock: newStock }, { transaction: t });

    await db.materialStockHistory.create({
      material_id: id,
      change_quantity: adjustmentQuantity,
      new_quantity: newStock,
      reason: `manual_adjustment: ${reason}`,
      related_entity_id: req.authData.user.id, // Log which user made the adjustment
    }, { transaction: t });

    await t.commit();

    logger.info(`Stock for material ID ${id} was manually adjusted by ${adjustmentQuantity}. Reason: ${reason}`);
    await clearCacheByTag(`user-adjustments:${req.authData.user.id}`);
    res.status(200).send({ message: 'Stock adjusted successfully.' });
  } catch (error) {
    await t.rollback();
    throw error;
  }
});

// Get all stock adjustments made by a specific user
exports.getStockAdjustmentsByUser = catchAsync(async (req, res) => {
  const userId = req.params.id;
  logger.info(`Retrieving stock adjustments for user ID: ${userId}`);
  const history = await db.materialStockHistory.findAll({
    where: {
      reason: { [Op.like]: 'manual_adjustment:%' },
      related_entity_id: userId,
    },
    include: [{ model: db.material, attributes: ['id', 'name'] }],
    order: [['createdAt', 'DESC']],
  });

  res.send(history);
});

// Revert a specific manual stock adjustment
exports.revertStockAdjustment = catchAsync(async (req, res) => {
  const { historyId } = req.params;
  const t = await db.sequelize.transaction();

  try {
    const originalAdjustment = await db.materialStockHistory.findByPk(historyId, { transaction: t });

    if (!originalAdjustment) {
      await t.rollback();
      return res.status(404).send({ message: 'Stock adjustment record not found.' });
    }

    if (!originalAdjustment.reason.startsWith('manual_adjustment')) {
      await t.rollback();
      return res.status(400).send({ message: 'This record is not a manual stock adjustment and cannot be reverted.' });
    }

    if (originalAdjustment.reverted) {
      await t.rollback();
      return res.status(409).send({ message: 'This stock adjustment has already been reverted.' });
    }

    const material = await Material.findByPk(originalAdjustment.material_id, { transaction: t });
    if (!material) {
      await t.rollback();
      return res.status(404).send({ message: 'Associated material not found.' });
    }

    const revertQuantity = -parseFloat(originalAdjustment.change_quantity);
    const newStock = parseFloat(material.quantity_in_stock) + revertQuantity;

    if (newStock < 0) {
      await t.rollback();
      return res.status(400).send({ message: 'Reverting this adjustment would result in a negative inventory.' });
    }

    // Update stock, create new history record, and mark original as reverted
    await material.update({ quantity_in_stock: newStock }, { transaction: t });
    await originalAdjustment.update({ reverted: true }, { transaction: t });
    await db.materialStockHistory.create({
      material_id: material.id,
      change_quantity: revertQuantity,
      new_quantity: newStock,
      reason: `revert_adjustment:${historyId}`,
      related_entity_id: req.authData.user.id,
    }, { transaction: t });

    await t.commit();

    logger.info(`Stock adjustment ID ${historyId} was successfully reverted by user ID ${req.authData.user.id}.`);
    res.status(200).send({ message: 'Stock adjustment reverted successfully.' });
  } catch (error) {
    await t.rollback();
    throw error;
  }
});

// Get a summary of all stock adjustments within a date range
exports.getStockAdjustmentsSummary = catchAsync(async (req, res) => {
  const { startDate, endDate } = req.query;
  logger.info(`Retrieving stock adjustments summary from ${startDate || 'start'} to ${endDate || 'end'}`);

  const whereClause = {
    reason: { [Op.like]: 'manual_adjustment:%' },
  };

  if (startDate || endDate) {
    whereClause.createdAt = {};
    if (startDate) {
      whereClause.createdAt[Op.gte] = new Date(startDate);
    }
    if (endDate) {
      whereClause.createdAt[Op.lte] = new Date(endDate);
    }
  }

  const history = await db.materialStockHistory.findAll({
    where: whereClause,
    include: [
      { model: db.material, attributes: ['id', 'name'] },
      { model: db.user, as: 'adjustingUser', attributes: ['id', 'fullName', 'username'] }
    ],
    order: [['createdAt', 'DESC']],
  });

  res.send(history);
});

// Get a summary of all stock adjustments for a specific material
exports.getStockAdjustmentsByMaterial = catchAsync(async (req, res) => {
  const materialId = req.params.id;
  logger.info(`Retrieving stock adjustments for material ID: ${materialId}`);
  const history = await db.materialStockHistory.findAll({
    where: {
      material_id: materialId,
      [Op.or]: [
        { reason: { [Op.like]: 'manual_adjustment:%' } },
        { reason: { [Op.like]: 'revert_adjustment:%' } }
      ]
    },
    include: [
      { model: db.user, as: 'adjustingUser', attributes: ['id', 'fullName', 'username'] }
    ],
    order: [['createdAt', 'DESC']],
  });

  res.send(history);
});

// Get a summary of all stock adjustments for a specific material category
exports.getStockAdjustmentsByCategory = catchAsync(async (req, res) => {
  const { category } = req.params;
  logger.info(`Retrieving stock adjustments summary for category: ${category}`);

  // Find all materials in the given category
  const materials = await Material.findAll({
    attributes: ['id'],
    where: {
      category: category,
      isDeleted: { [Op.ne]: true }
    }
  });

  if (materials.length === 0) {
    return res.send([]); // No materials in this category, so no adjustments
  }

  const materialIds = materials.map(m => m.id);

  const history = await db.materialStockHistory.findAll({
    where: {
      material_id: { [Op.in]: materialIds },
      [Op.or]: [
        { reason: { [Op.like]: 'manual_adjustment:%' } },
        { reason: { [Op.like]: 'revert_adjustment:%' } }
      ]
    },
    include: [
      { model: db.material, attributes: ['id', 'name', 'category'] },
      { model: db.user, as: 'adjustingUser', attributes: ['id', 'fullName', 'username'] }
    ],
    order: [['createdAt', 'DESC']],
  });

  res.send(history);
});