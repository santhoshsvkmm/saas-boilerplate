const db = require("../models");
const Features = db.feature;
const catchAsync = require("../utils/catchAsync");
const logger = require('../loggers/logger');

const createFeatures = catchAsync(async (req,res) => {


    if (!req.body) {
        return res.status(400).send({
            message: "Content can not be empty!"
        });
    }
   

    const feature = {
        feature_name:req.body.feature_name,
        description:req.body.description,
        is_active:req.body.is_active,
        organisation_id:req.body.organisation_id
    }

    const featureExists = await Features.findOne({ where: { feature_name: feature.feature_name,organisation_id:feature.organisation_id } });

    if(featureExists) {
        logger.warn(`Feature creation failed for organisation ID ${feature.organisation_id}: feature '${feature.feature_name}' already exists.`);
        return res.status(403).send({
            message: "Feature already exists"
        });
    }

    const data = await Features.create(feature);
    const featureData = {
        feature_name:data.feature_name,
    };
    logger.info(`Feature '${data.feature_name}' created successfully for organisation ID ${data.organisation_id}`);
    res.status(201).send({
        featureData,
        message:   `${featureData.feature_name} feature is Created Successfully`
    });
});

const getAllFeatures = catchAsync(async (req,res) => {
    logger.info('Retrieving all features.');
    const data = await Features.findAll({
        where: { is_active: true }
    });
    res.send(data);
});

const getAllFeaturesByOrganisationId = catchAsync(async (req,res) => {
    const organisationId = req.params.id;
    logger.info(`Retrieving all features for organisation ID: ${organisationId}`);
    const data = await Features.findAll({ 
        where: {organisation_id: organisationId, is_active: true } 
    });
    res.send(data);
});

const getFeatureById = catchAsync(async (req, res) => {
    const id = req.params.id;
    logger.info(`Retrieving feature with ID: ${id}`);
    const data = await Features.findByPk(id);
    res.send(data);
});
  
const updateFeatureById  = catchAsync(async (req,res) => {
    const id = req.params.id;
    logger.info(`Attempting to update feature with ID: ${id}`);
    const [num] = await Features.update(req.body, { where: { id: id } });

    if(num == 1){
        logger.info(`Feature updated successfully with ID: ${id}`);
        res.send({
            message: "Feature was updated successfully.",
        });
    } else {
        res.send({
            message: `Cannot update Feature with id=${id}. Maybe Feature was not found or req.body is empty!`,
        });
    }
});

const deleteFeatureById = catchAsync(async (req, res) => {
    const id = req.params.id;
    logger.info(`Attempting to delete feature with ID: ${id}`);
    const [num] = await Features.update({ is_active: false }, { where: { id: id } });

    if (num == 1) {
        logger.info(`Feature deleted successfully with ID: ${id}`);
        res.send({
            message: "Feature was deleted successfully!",
        });
    } else {
        res.send({
            message: `Cannot delete Feature with id=${id}. Maybe Feature was not found!`,
        });
    }
});

const findFeature = (req,res) => {
    // This function is empty.
}


module.exports ={
    createFeatures,
    getAllFeatures,
    getFeatureById,
    getAllFeaturesByOrganisationId,
    updateFeatureById,
    findFeature,
    deleteFeatureById
}