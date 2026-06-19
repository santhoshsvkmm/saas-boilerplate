const Joi = require('joi');

const createPurchaseOrder = {
  body: Joi.object().keys({
    material_id: Joi.number().integer().required(),
    supplier_id: Joi.number().integer(),
    sub_contractor_id: Joi.number().integer(),
    OrderedQuantity: Joi.number().required(),
    OrderDate: Joi.date().iso().required(),
    ExpectedDeliveryDate: Joi.date().iso().required().min(Joi.ref('OrderDate')),
    material_procurement_plan_id: Joi.number().integer(),
    batch_number: Joi.string().allow('', null),
    status: Joi.string().valid('pending', 'partially_delivered', 'fully_delivered'),
  }).xor('supplier_id', 'sub_contractor_id'), // Ensures one and only one is present
};

const updatePurchaseOrder = {
  params: Joi.object().keys({
    id: Joi.number().integer(),
  }),
  body: Joi.object()
    .keys({
      OrderedQuantity: Joi.number(),
      ExpectedDeliveryDate: Joi.date().iso(),
      status: Joi.string().valid('pending', 'partially_delivered', 'fully_delivered'),
    })
    .min(1),
};

module.exports = {
  createPurchaseOrder,
  updatePurchaseOrder,
};