var express = require('express');
var router = express.Router();
var validate = require('../middleware/validate.middleware.js');
const {featureValidation}= require("../validationSchemas/feature.validation.js")

// const withAuth = require('../withAuth')
const  feature = require('../controllers/feature.controller.js')


router.post('/createfeature',validate(featureValidation), feature.createFeatures);
router.get('/getAllfeature',validate, feature.getAllFeatures);
router.get('/getfeatureById',validate, feature.getFeatureById);
router.put('/updatefeature',validate, feature.getAllFeatures);
router.get('/findfeature',validate, feature.findFeature);


module.exports = router;