const db = require("../../models");
const User = db.user;
const UserPersonalInfo = db.userPersonalInfo;
const UserFinancialInfo = db.userFinancialInfo;
const bcrypt = require('bcrypt');
const Organisation = db.organisation;
const OrganisationDetails = db.organisationDetails;
const sendEmail = require("../../middleware/email.middleware");
const organisationVerfication = require('../../emailTemplates/organisationVerfication')


// Create and Save a new User
exports.create = (req, res) => {
    // Validate request
    if (!req.body) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
        return;
    }

    let hash = null;
    if(req.body.password) {
        hash = bcrypt.hashSync(req.body.password.toString(), 10);
    }

    // Create a User
    const user = {
        firstname:req.body.firstname,
        lastname:req.body.lastname,
        is_active:true,
        department_id:null,
        username: req.body.username,
        email: req.body.email,
        password: hash,
        fullName: req.body.fullname,
        role: "ROLE_ADMIN",
    };

    // Save User in the database
    User.findOne({ where: { username: user.username } })
        .then(organisationExists => {
            if (!organisationExists) {
                User.create(user)
                    .then(data => {
                        let userData = {
                            userId: data.dataValues.id
                        }
                        UserPersonalInfo.create(userData)
                        .then(data => {
                            UserFinancialInfo.create(userData)
                            .then(data => {
                                res.send(data)
                            })
                            .catch(err => {
                                console.log(err)
                                res.status(500).send({
                                    message:
                                        err.message || "Some error occurred while creating the User."
                                }); 
                            })
                        })
                        .catch(err => {
                            console.log(err)
                            res.status(500).send({
                                message:
                                    err.message || "Some error occurred while creating the User."
                            }); 
                        })
                        res.send(data);
                    })
                    .catch(err => {
                        res.status(500).send({
                            message:
                                err.message || "Some error occurred while creating the User."
                        });
                    });
            } else {
                res.status(403).send({
                    message: "Username already exists"
                })
            }
        })
};


exports.createOrganisation = (req,res) => {
    if (!req.body) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
        return;
    }



    const organisation = {
         organisation_name:req.body.organisation_name,
         is_active:true,
         is_verified:false,
    }


    User.findOne({ where: { organisation_name : organisation.organisation_name } })
    .then(organisationExists => {
        if (!organisationExists) {
            Organisation.create(organisation)
                .then(data => {
                    let organisationData = {
                        organisation_id: data.dataValues.id
                    }
                    OrganisationDetails.create(organisationData)
                    .then(data => {


                            sendEmail(req.body.email,"Organisation Verification",organisationVerfication)
                            res.send(data);

                     }) .catch(err => {
                        console.log(err)
                        res.status(500).send({
                            message:
                                err.message || "Some error occurred while creating the Organisation."
                        }); 
                    });
                })
                .catch(err => {
                    res.status(500).send({
                        message:
                            err.message || "Some error occurred while creating the Organisation."
                    });
                });
        } else {
            res.status(403).send({
                message: "Organisation already exists"
            })
        }
    })



}