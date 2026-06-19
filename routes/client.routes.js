var express = require('express');
var router = express.Router();

const withAuth = require('../middleware/withAuth.middleware.js');
const { cacheMiddleware } = require("../middleware/cache.middleware.js");
const validate = require('../middleware/validate.middleware.js');
const { createClient, updateClient } = require('../validationSchemas/client.validation.js');

const client = require("../controllers/client.controller.js");

// Create a new Client
router.post('/', withAuth.verifyToken, withAuth.withRoleAdminOrManager, validate(createClient), client.create);

// Retrieve all Clients
router.get('/', withAuth.verifyToken, withAuth.withRoleAdminOrManager, cacheMiddleware('clients'), client.findAll);

// Retrieve a single Client with an id
router.get('/:id', withAuth.verifyToken, withAuth.withRoleAdminOrManager, client.findOne);

// Update a Client with an id
router.put('/:id', withAuth.verifyToken, withAuth.withRoleAdminOrManager, validate(updateClient), client.update);

// Delete a Client with an id
router.delete('/:id', withAuth.verifyToken, withAuth.withRoleAdmin, client.delete);

module.exports = router;