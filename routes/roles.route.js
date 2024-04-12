var express = require('express');
var router = express.Router();
// var validate = require('../middleware/validate.middleware.js');
// const {featureValidation}= require("../validationSchemas/feature.validation.js");

const  role = require('../controllers/register/role.controller.js');



router.post('/createroles', role.createRoles);


module.exports = router;