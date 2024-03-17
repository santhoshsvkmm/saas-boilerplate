var express = require('express');
var router = express.Router();
var validate = require('../../middleware/validate.middleware.js');
const register = require("../../controllers/register/register.controller.js");
const {registerValidation} = require("../../validationSchemas/auth.validation.js")
// Create a new user
router.post('/',validate(registerValidation), register.create);

module.exports = router;