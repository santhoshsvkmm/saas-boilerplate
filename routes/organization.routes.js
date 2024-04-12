var express = require('express');
var router = express.Router();

const withAuth = require('../withAuth');

const organisation = require("../controllers/organisation.controller.js");

// Create a new Organization
router.post('/', organisation.create);

//Retrieve a single Organization with an id
router.get('/:id', withAuth.verifyToken, organisation.findOne);

// Update an Organization with id
router.put('/:id', withAuth.verifyToken, withAuth.withRoleAdmin, withAuth.verifyToken, organisation.update);

// Delete an Organization with id
router.delete('/:id', withAuth.verifyToken, withAuth.withRoleAdmin, organisation.delete);

// Delete all Organizations
router.delete('/', withAuth.verifyToken, withAuth.withRoleAdmin, organisation.deleteAll);

module.exports = router;
