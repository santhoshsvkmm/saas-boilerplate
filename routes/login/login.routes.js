var express = require('express');
var router = express.Router();

const login = require("../../controllers/login/login.controller.js");
const forgotPasswordController = require("../../controllers/password/forgotpassword.controller.js");
const resetPasswordController = require("../../controllers/password/resetpassword.controller.js");


//validation
var validate = require('../../middleware/validate.middleware.js');
const {resetPasswordValidation,forgotPasswordValidation} = require("../../validationSchemas/password.validation.js")

// Create a new user
router.post('/', login.authenticate);
router.post('/forgotpassword',validate(forgotPasswordValidation), forgotPasswordController);
router.post('/resetpassword',validate(resetPasswordValidation), resetPasswordController);

module.exports = router;