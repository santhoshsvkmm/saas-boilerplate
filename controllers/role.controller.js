const db = require("../models");
const Roles = db.roles;
const catchAsync = require("../utils/catchAsync");
const logger = require('../loggers/logger');



const createRoles = catchAsync(async (req, res) => {
    if (!req.body) {
        return res.status(400).send({
            message: "Content can not be empty!"
        });
    }

    if (req.body.feature_ids.length < 0 ) {
        return res.status(400).json({ error: `Minimum one feature is required `})
    }

    const role = {
        role_name: req.body.role_name,
        description: req.body.description,
        is_active: req.body.is_active,
        organisation_id: req.body.organisation_id,
        feature_ids:req.body.feature_ids
    }

    const roleExists = await Roles.findOne({ where: { role_name: role.role_name, organisation_id: role.organisation_id } });

    if (roleExists) {
        logger.warn(`Role creation failed for organisation ID ${role.organisation_id}: role '${role.role_name}' already exists.`);
        return res.status(403).send({
            message: "Role already exists"
        });
    }

    const data = await Roles.create(role);
    const roleData = {
        role_name: data.role_name,
    };

    logger.info(`Role '${data.role_name}' created successfully for organisation ID ${data.organisation_id}`);
    return res.status(201).send({
        roleData,
        message: `${roleData.role_name} role is Created Successfully`
    });
});



module.exports = {
    createRoles
}
