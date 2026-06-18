var express = require('express');
var router = express.Router();

const withAuth = require("../middleware/withAuth.middleware.js")

const skills = require("../controllers/skills.controller.js");

// Create a new Skill
router.post('/', withAuth.verifyToken, withAuth.withRoleAdmin, skills.create);

// Retrieve all Skills
router.get('/', withAuth.verifyToken, withAuth.withRoleAdminOrManager, skills.findAll);

// Retrieve all Skills for a SkillType
router.get('/skill-type/:id', withAuth.verifyToken, withAuth.withRoleAdminOrManager, skills.findAllBySkillType);

// Retrieve a single Skill with an id
router.get('/:id', withAuth.verifyToken, withAuth.withRoleAdminOrManager, skills.findOne);

// Update a Skill with an id
router.put('/:id', withAuth.verifyToken, withAuth.withRoleAdmin, skills.update);

// Delete a Skill with an id
router.delete('/:id', withAuth.verifyToken, withAuth.withRoleAdmin, skills.delete);

// Delete all Skills
router.delete('/', withAuth.verifyToken, withAuth.withRoleAdmin, skills.deleteAll);

module.exports = router;