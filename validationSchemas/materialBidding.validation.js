const Joi = require('joi');

const createBid = {
  body: Joi.object().keys({
    material_tender_id: Joi.number().integer().required(),
    supplier_id: Joi.number().integer().required(),
    bid_amount: Joi.number().precision(2).required(),
    notes: Joi.string().allow('', null),
    status: Joi.string().valid('submitted', 'accepted', 'rejected', 'withdrawn'),
  }),
};

const updateBid = {
  params: Joi.object().keys({
    id: Joi.number().integer(),
  }),
  body: Joi.object()
    .keys({
      bid_amount: Joi.number().precision(2),
      notes: Joi.string().allow('', null),
      status: Joi.string().valid('submitted', 'accepted', 'rejected', 'withdrawn'),
    })
    .min(1),
};

module.exports = {
  createBid,
  updateBid,
};