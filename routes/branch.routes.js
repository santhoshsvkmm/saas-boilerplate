var express = require('express');
var router = express.Router();

const withAuth = require("../middleware/withAuth.middleware.js")

const branch = require("../controllers/branch.controller.js");

// Create a new Branch
router.post('/', withAuth.verifyToken, withAuth.withRoleAdmin, branch.create);

// Retrieve all Branches
router.get('/', withAuth.verifyToken, withAuth.withRoleAdminOrManager, branch.findAll);

// Retrieve all Branches for an Organisation
router.get('/organisation/:id', withAuth.verifyToken, withAuth.withRoleAdminOrManager, branch.findAllByOrganisation);

// Retrieve a single Branch with an id
router.get('/:id', withAuth.verifyToken, withAuth.withRoleAdminOrManager, branch.findOne);

// Update a Branch with an id
router.put('/:id', withAuth.verifyToken, withAuth.withRoleAdmin, branch.update);

// Delete a Branch with an id
router.delete('/:id', withAuth.verifyToken, withAuth.withRoleAdmin, branch.delete);

// Delete all Branches
router.delete('/', withAuth.verifyToken, withAuth.withRoleAdmin, branch.deleteAll);

module.exports = router;