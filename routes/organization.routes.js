var express = require('express');
var router = express.Router();

const withAuth = require('../withAuth');
var validate = require('../middleware/validate.middleware.js');
const organisation = require("../controllers/organisation.controller.js");
const {organisationVerificationValidation,organisationValidation} = require("../validationSchemas/organisation.validation.js")

// Create a new Organization
router.post('/', organisation.create);


router.post('/verifyorganisation',validate(organisationVerificationValidation), organisation.verifyOrganisation);

//Retrieve a single Organization with an id
router.get('/:id', withAuth.verifyToken, organisation.findOne);

// Update an Organization with id
router.put('/:id', withAuth.verifyToken, withAuth.withRoleAdmin, withAuth.verifyToken, organisation.update);

// Delete an Organization with id
router.delete('/:id', withAuth.verifyToken, withAuth.withRoleAdmin, organisation.delete);

// Delete all Organizations
router.delete('/', withAuth.verifyToken, withAuth.withRoleAdmin, organisation.deleteAll);

module.exports = router;
