var express = require('express');
var router = express.Router();
var validate = require('../middleware/validate.middleware.js');
const {roleValidation} = require("../validationSchemas/role.validation.js")

const  role = require('../controllers/role.controller.js');



router.post('/createroles',validate(roleValidation), role.createRoles);


module.exports = router;