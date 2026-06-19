const Joi = require('joi');

const createMaterial = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    description: Joi.string().allow('', null),
    category: Joi.string(),
    unit: Joi.string(),
    quantity_in_stock: Joi.number().precision(2),
    unit_price: Joi.number().precision(2),
    safety_stock: Joi.number().integer(),
    reorder_level: Joi.number().integer(),
    supplier_id: Joi.number().integer(),
    project_id: Joi.number().integer(),
    organisation_id: Joi.number().integer().required(),
    status: Joi.string(),
  }),
};

const updateMaterial = {
  params: Joi.object().keys({
    id: Joi.number().integer(),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string(),
      description: Joi.string().allow('', null),
      category: Joi.string(),
      unit: Joi.string(),
      quantity_in_stock: Joi.number().precision(2),
      unit_price: Joi.number().precision(2),
      safety_stock: Joi.number().integer(),
      reorder_level: Joi.number().integer(),
      supplier_id: Joi.number().integer(),
      status: Joi.string(),
    })
    .min(1),
};

const adjustStock = {
  params: Joi.object().keys({
    id: Joi.number().integer(),
  }),
  body: Joi.object().keys({
    adjustmentQuantity: Joi.number().required().not(0), // Can be positive or negative, but not zero
    reason: Joi.string().required().min(5),
  }),
};

const revertStockAdjustment = {
  params: Joi.object().keys({
    historyId: Joi.number().integer(),
  }),
};

const getStockAdjustmentsSummary = {
  query: Joi.object().keys({
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')),
  }),
};

const getStockAdjustmentsByCategory = {
  params: Joi.object().keys({
    category: Joi.string().required(),
  }),
};

module.exports = {
  createMaterial,
  updateMaterial,
  adjustStock,
  revertStockAdjustment,
  getStockAdjustmentsSummary,
  getStockAdjustmentsByCategory,
};