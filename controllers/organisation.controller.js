const db = require("../models");
const Organisation = db.organisation;
const OrganisationInfo = db.organisationDetails;
const { createUser } = require("./user.controller");
const User = db.user;
const sendEmail = require("../middleware/email.middleware");
const organisationVerfication = require("../emailTemplates/organisationVerfication");
const  {generateJwtSecretKey,generateUrlToken} = require ("../utils/token");


const createOrganization = async (organisation, userdetails, userPersonalInfo, res) => {
  try {
    const existingOrganization = await Organisation.findOne({ where: { organisationName: organisation.organisationName } });

    if (existingOrganization) {
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
    const urlToken = generateUrlToken(payload, generateJwtSecretKey(32), expiresIn);
    await sendEmail(userdetails.email,"Organisation Verification",organisationVerfication(urlToken));
    res.cookie('token', token, { httpOnly: true });
    res.send({ data: createdOrganization, message: "Organisation is Created Successfully" });
  } catch (error) {
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


exports.verifyOrganisation = (req,res) => {
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

  const decodedValue = decodeToken(req.body.token,)
   const verificationPayload =  {
      token:req.body.token,
      isVerified:true,
      password:hash
   }

   try {
  
    const token = ""



   } catch (error) {
       res.status(500).send({ message: error.message || "Some error occurred while verification the Organization" });
   }


}

// Retrieve all organisations from the database.
exports.findAll = (req, res) => {
  var authData = req.authData;
  Organisation.findAll({
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

  Organisation.update(req.body, {
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
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

  Organisation.destroy({
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
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
  Organisation.destroy({
    where: {},
    truncate: false,
  })
    .then((nums) => {
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
