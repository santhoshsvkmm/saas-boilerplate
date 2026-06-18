var express = require('express');
var router = express.Router();

const withAuth = require("../middleware/withAuth.middleware.js")

const designation = require("../controllers/designation.controller.js");

// Create a new Designation
router.post('/', withAuth.verifyToken, withAuth.withRoleAdmin, designation.create);

// Retrieve all Designations
router.get('/', withAuth.verifyToken, withAuth.withRoleAdminOrManager, designation.findAll);

// Retrieve all Designations for a Department
router.get('/department/:id', withAuth.verifyToken, withAuth.withRoleAdminOrManager, designation.findAllByDepartment);

// Retrieve a single Designation with an id
router.get('/:id', withAuth.verifyToken, withAuth.withRoleAdminOrManager, designation.findOne);

// Update a Designation with an id
router.put('/:id', withAuth.verifyToken, withAuth.withRoleAdmin, designation.update);

// Delete a Designation with an id
router.delete('/:id', withAuth.verifyToken, withAuth.withRoleAdmin, designation.delete);

// Delete all Designations
router.delete('/', withAuth.verifyToken, withAuth.withRoleAdmin, designation.deleteAll);

module.exports = router;