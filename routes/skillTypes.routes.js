var express = require('express');
var router = express.Router();

const withAuth = require("../middleware/withAuth.middleware.js")

const skillTypes = require("../controllers/skillTypes.controller.js");

// Create a new SkillType
router.post('/', withAuth.verifyToken, withAuth.withRoleAdmin, skillTypes.create);

// Retrieve all SkillTypes
router.get('/', withAuth.verifyToken, withAuth.withRoleAdminOrManager, skillTypes.findAll);

// Retrieve all SkillTypes for an Organisation
router.get('/organisation/:id', withAuth.verifyToken, withAuth.withRoleAdminOrManager, skillTypes.findAllByOrganisation);

// Retrieve a single SkillType with an id
router.get('/:id', withAuth.verifyToken, withAuth.withRoleAdminOrManager, skillTypes.findOne);

// Update a SkillType with an id
router.put('/:id', withAuth.verifyToken, withAuth.withRoleAdmin, skillTypes.update);

// Delete a SkillType with an id
router.delete('/:id', withAuth.verifyToken, withAuth.withRoleAdmin, skillTypes.delete);

// Delete all SkillTypes
router.delete('/', withAuth.verifyToken, withAuth.withRoleAdmin, skillTypes.deleteAll);

module.exports = router;