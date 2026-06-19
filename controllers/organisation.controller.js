const db = require("../models");
const Organisation = db.organisation;
const OrganisationInfo = db.organisationDetails;
const User = db.user;
const sendEmail = require("../services/email.services");
const organisationVerfication = require("../emailTemplates/organisationVerfication");
const  {generateUrlToken,decodeToken} = require ("../utils/token");
const logger = require('../loggers/logger');
require('dotenv').config()
const bcrypt = require("bcrypt");



const createOrganization = async (organisation, userdetails, userPersonalInfo, res) => {
  try {
    const existingOrganization = await Organisation.findOne({ where: { organisationName: organisation.organisationName } });

    if (existingOrganization) {
      logger.warn(`Organisation creation failed: name '${organisation.organisationName}' already exists.`);
      return res.status(401).send({ message: "Organisation Name already exists" });
    }
    
    const createdOrganization = await Organisation.create(organisation);
    await User.create({ ...userdetails, organisationId: createdOrganization.id })
    await OrganisationInfo.create({ ...userPersonalInfo, organisationId: createdOrganization.id });
    const payload = {
       id:createdOrganization.id,
       action:'organisationVerification'
    }
    const expiresIn = '1h';
    const secertKey = process.env.JWT_SECRET_KEY
    const urlToken = generateUrlToken(payload,secertKey , expiresIn);
    await sendEmail(userdetails.email,"Organisation Verification",organisationVerfication(urlToken,createdOrganization));
    res.cookie('token', urlToken, { httpOnly: true });
    logger.info(`Organisation '${createdOrganization.organisationName}' created successfully with ID: ${createdOrganization.id}. Verification email sent to ${userdetails.email}.`);
    res.send({ data: createdOrganization, message: "Organisation is Created Successfully" });
  } catch (error) {
    logger.error(`Error during organisation creation: ${error.message}`);
    res.status(500).send({ message: error.message || "Some error occurred while creating the Organization" });
  }
};

// Create and Save a new organisation
exports.create = (req, res) => {
  // Validate request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
    return;
  }

  // Create an organisation
  const organisation = {
    organisationName: req.body.organisationName,
    isActive: true,
    isVerified: false,
  };

  const userdetails = {
    email: req.body.email,
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    username: req.body.username,
    role: "ROLE_ADMIN",
    isActive: true,
    isVerified: false,
    departmentId: req.body.departmentId,
  };

  const userPersonalInfo = {
    city: req.body.city,
    country: req.body.country,
  };

  // Save User in the database
  createOrganization(organisation, userdetails, userPersonalInfo, res);
};


exports.verifyOrganisation = async (req,res) => {
   if(!req.body) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
    return;
   }
   let hash = null;
   if(req.body.password) {
    hash = bcrypt.hashSync(req.body.password.toString(), 10);
   }   
  const secertKey = process.env.JWT_SECRET_KEY;
  const decodedValue = decodeToken(req.body.token,secertKey);
   try {
    const {id} = decodedValue;
    const existingOrganization = await Organisation.findOne({ where: { id: id } });
    const {dataValues} = existingOrganization;
    if (existingOrganization) {
      await User.update({password:hash}, {where: {organisation_id:id,role:"ROLE_ADMIN"}});
      await Organisation.update({...dataValues,isVerified:true},{where: {id: id}});
      logger.info(`Organisation verified successfully for ID: ${id}`);
      res.send({ message: "Organisation is Verified  Successfully" });
    }
   } catch (error) {
      logger.error(`Error during organisation verification for token ${req.body.token}: ${error.message}`);
       res.status(500).send({ message: error.message || "Some error occurred while verification the Organization" });
   }
}

// Retrieve all organisations from the database.
exports.findAll = (req, res) => {
  var authData = req.authData;
  logger.info('Retrieving all organisations.');
  Organisation.findAll({
    where: { isActive: true },
    include: [{ model: db.department, as: db.department.tablename }],
  })
    .then((data) => {
      res.json({ data: data, authData });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving organisations.",
      });
    });
};

// Find a single organisation with an id
exports.findOne = (req, res) => {
  const id = req.params.id;
  var authData = req.authData;
  logger.info(`Retrieving organisation with ID: ${id}`);

  Organisation.findByPk(id)
    .then((data) => {
      res.status(200).send({ data: data, authData: authData });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({
        message: "Error retrieving organisation with id=" + id,
      });
    });
};

// Update an organisation by the id in the request
exports.update = (req, res) => {
  const id = req.params.id;
  logger.info(`Attempting to update organisation with ID: ${id}`);

  Organisation.update(req.body, {
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        logger.info(`Organisation updated successfully with ID: ${id}`);
        res.send({
          message: "organisation was updated successfully.",
        });
      } else {
        res.send({
          message: `Cannot update organisation with id=${id}. Maybe organisation was not found or req.body is empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error updating organisation with id=" + id,
      });
    });
};

// Delete an organisation with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;
  logger.info(`Attempting to delete organisation with ID: ${id}`);

  Organisation.update({ isActive: false }, {
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        logger.info(`Organisation deleted successfully with ID: ${id}`);
        res.send({
          message: "organisation was deleted successfully!",
        });
      } else {
        res.send({
          message: `Cannot delete organisation with id=${id}. Maybe Tutorial was not found!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete organisation with id=" + id,
      });
    });
};

// Delete all organisations from the database.
exports.deleteAll = (req, res) => {
  logger.warn('Attempting to delete all organisations.');
  Organisation.update({ isActive: false }, {
    where: {},
  })
    .then((nums) => {
      logger.info(`${nums.length} organisations were deleted successfully.`);
      res.send({ message: `${nums} organisations were deleted successfully!` });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message ||
          "Some error occurred while removing all organisations.",
      });
    });
};
