const db = require("../../models");
const Roles = db.roles;



const checkRoleExists = (role, res) => {
    Roles.findOne({ where: { role_name: role.role_name, organisation_id: role.organisation_id } })
        .then(roleExists => {
            if (!roleExists) {
                createNewRole(role, res);
            } else {
                return res.status(403).send({
                    message: "Role already exists"
                });
            }
        })
        .catch(err => {
            console.log(err);
            return res.status(500).send({
                message: err.message || "Some error occurred while checking the role."
            });
        });
};



const createNewRole = (role, res) => {
    console.log("-----role------",role)
    Roles.create(role)
        .then(data => {
            const roleData = {
                role_name: data.role_name,
            }
            return res.status(200).send({
                roleData,
                message: `${roleData.role_name} role is Created Successfully`
            });
        })
        .catch(err => {
            console.log(err);
            return res.status(500).send({
                message: err.message || "Some error occurred while creating the role."
            });
        });
};



const createRoles = (req, res) => {
    if (!req.body) {
        return res.status(400).send({
            message: "Content can not be empty!"
        });
    }

    const role = {
        role_name: req.body.role_name,
        description: req.body.description,
        is_active: req.body.is_active,
        organisation_id: req.body.organisation_id,
        feature_id:req.body.feature_id
    }

    checkRoleExists(role, res);
};


module.exports = {
    createRoles
}


