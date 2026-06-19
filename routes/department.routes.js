var express = require('express');
var router = express.Router();

const withAuth = require("../middleware/withAuth.middleware.js")
const { cacheMiddleware } = require("../middleware/cache.middleware.js");
const validate = require('../middleware/validate.middleware.js');
const { createDepartment, updateDepartment } = require('../validationSchemas/department.validation.js');

const department = require("../controllers/department.controller.js");

// Create a new Department
router.post('/', withAuth.verifyToken, withAuth.withRoleAdmin, validate(createDepartment), department.create);

//Retrieve all Departments
router.get('/', withAuth.verifyToken, withAuth.withRoleAdminOrManager, cacheMiddleware('departments'), department.findAll);

//Retrieve a single Department with an id
router.get('/:id', withAuth.verifyToken, department.findOne);

// Update a Department with an id
router.put('/:id', withAuth.verifyToken, withAuth.withRoleAdminOrManager, validate(updateDepartment), department.update);

// Delete a Department with an id
router.delete('/:id', withAuth.verifyToken, withAuth.withRoleAdmin, department.delete);

// Delete all Departments
router.delete('/', withAuth.verifyToken, withAuth.withRoleAdmin, department.deleteAll);

module.exports = router;
