const Joi = require('joi');

const createDelivery = {
  body: Joi.object().keys({
    material_purchase_order_id: Joi.number().integer().required(),
    ActualQuantity: Joi.number().required(),
    ActualDeliveryDate: Joi.date().iso().required(),
  }),
};

const updateDelivery = {
  params: Joi.object().keys({
    id: Joi.number().integer(),
  }),
  body: Joi.object()
    .keys({
      ActualQuantity: Joi.number(),
      ActualDeliveryDate: Joi.date().iso(),
    })
    .min(1),
};

module.exports = {
  createDelivery,
  updateDelivery,
};