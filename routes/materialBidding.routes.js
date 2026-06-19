var express = require('express');
var router = express.Router();

const withAuth = require('../middleware/withAuth.middleware.js');
const { cacheMiddleware } = require("../middleware/cache.middleware.js");
const validate = require('../middleware/validate.middleware.js');
const { createBid, updateBid } = require('../validationSchemas/materialBidding.validation.js');

const bidding = require("../controllers/materialBidding.controller.js");

// Create a new Bid on a Tender
router.post('/', withAuth.verifyToken, validate(createBid), bidding.create);

// Retrieve all Bids for a specific Tender
router.get('/tender/:id', withAuth.verifyToken, withAuth.withRoleAdminOrManager, (req, res, next) => cacheMiddleware(`tender:${req.params.id}`)(req, res, next), bidding.findAllByTender);

// Retrieve a single Bid with an id
router.get('/:id', withAuth.verifyToken, bidding.findOne);

// Update a Bid with an id
router.put('/:id', withAuth.verifyToken, validate(updateBid), bidding.update);

// Delete a Bid with an id
router.delete('/:id', withAuth.verifyToken, bidding.delete);

// Accept a Bid
router.put('/:id/accept', withAuth.verifyToken, withAuth.withRoleAdminOrManager, bidding.accept);

module.exports = router;