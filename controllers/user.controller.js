const db = require("../models");
const User = db.user;
const UserPersonalInfo = db.userPersonalInfo;
const UserFinancialInfo = db.userFinancialInfo;
const Department = db.department;
const Job = db.job
const Payment = db.payment;
const Op = db.Sequelize.Op;

const bcrypt = require('bcrypt');
const catchAsync = require("../utils/catchAsync");
const logger = require('../loggers/logger');


// Create and Save a new User
exports.create = catchAsync(async (req, res) => {
    // Validate request
    if (!req.body) {
        return res.status(400).send({
            message: "Content can not be empty!"
        });
    }

    const userExists = await User.findOne({ where: { username: req.body.username } });
    if (userExists) {
        logger.warn(`User creation failed for username '${req.body.username}': username already exists.`);
        return res.status(409).send({ message: "Username already exists." });
    }

    let hash = null;
    if (req.body.password) {
        hash = bcrypt.hashSync(req.body.password.toString(), 10);
    }
    // Create a User
    const user = {
        username: req.body.username,
        password: hash,
        fullName: req.body.fullName,
        role: req.body.role,
        active: true,
        departmentId: req.body.departmentId
    };
    const data = await User.create(user);
    logger.info(`User created successfully with ID: ${data.id}`);
    res.status(201).send(data);
});

// Retrieve all Users from the database.
exports.findAll = catchAsync(async (req, res) => {
    logger.info('Retrieving all users.');
    const data = await User.findAll({
        where: { active: true },
        include: [{
            model: UserPersonalInfo
        }, {
            model: UserFinancialInfo
        }, {
            model: Department
        }, {
            model: Job
        }]
    })
    res.send(data);
});

// Retrieve all Users from the database.
exports.findTotal = catchAsync(async (req, res) => {
    logger.info('Retrieving total user count.');
    const data = await User.count({
        where: { active: true }
    });
    res.send(data.toString());
});

// Retrieve all Users from the database.
exports.findTotalByDept = catchAsync(async (req, res) => {
    const id = req.params.id
    
    logger.info(`Retrieving total user count for department ID: ${id}`);
    const data = await User.count({
        where: {departmentId: id, active: true}
    })
    res.send(data.toString());
});


// Retrieve all Users by Department Id
exports.findAllByDeptId = catchAsync(async (req, res) => {
    const departmentId = req.params.id;
    logger.info(`Retrieving all users for department ID: ${departmentId}`);

    const data = await User.findAll({ 
        where: { departmentId: departmentId, active: true },
        include: [UserPersonalInfo, UserFinancialInfo, Department, Job] 
    });
    res.send(data);
});

// Find a single User with an id
exports.findOne = catchAsync(async (req, res) => {
    const id = req.params.id;
    logger.info(`Retrieving user with ID: ${id}`);

    const data = await User.findOne({
        include: [UserPersonalInfo, UserFinancialInfo, Department, {
            model: Job,
            include: [{
                model: Payment
            }]
        }],
        where: {
            id: id
        }
    });
    res.send(data);
});

// Update a User by the id in the request
exports.update = catchAsync(async (req, res) => {
    const id = req.params.id;
    logger.info(`Attempting to update user with ID: ${id}`);

    if(req.body.password) {
        req.body.password = bcrypt.hashSync(req.body.password.toString(), 10);
    }

    const [num] = await User.update(req.body, {
        where: { id: id }
    });

    if (num == 1) {
        res.send({
            // message: "User was updated successfully."
            message: "User was updated successfully."
        });
    } else {
        res.send({
            message: `Cannot update User with id=${id}. Maybe User was not found or req.body is empty!`
        });
    }
});

exports.changePassword = catchAsync(async (req, res) => {
    const id = req.params.id;
    logger.info(`Attempting to change password for user ID: ${id}`);

    if (!req.body.oldPassword || !req.body.newPassword) {
        return res.status(400).send({
            message: "Please send oldPassword and newPassword!"
        });
    }

    const user = await User.findOne({
        where: {id: id}
    });

    if (!user) {
        logger.warn(`Password change failed: User not found with ID: ${id}`);
        return res.status(400).send({ message: "No such user!" });
    }

    if (!bcrypt.compareSync(req.body.oldPassword, user.password)) {
        logger.warn(`Password change failed for user ID ${id}: Incorrect old password.`);
        return res.status(400).send({ message: "Wrong Password" });
    }

    const hash = bcrypt.hashSync(req.body.newPassword, 10);
    const [num] = await User.update({ password: hash }, { where: { id: id } });

    if (num == 1) {
        logger.info(`Password changed successfully for user ID: ${id}`);
        res.send({
            message: "User password was updated successfully."
        });
    } else {
        res.send({
            message: `Cannot update User with id=${id}.`
        });
    }
});

// Delete a User with the specified id in the request
exports.delete = catchAsync(async (req, res) => {
    const id = req.params.id;
    logger.info(`Attempting to delete user with ID: ${id}`);

    const [num] = await User.update({ active: false }, {
        where: { id: id }
    });

    if (num == 1) {
        logger.info(`User deleted successfully with ID: ${id}`);
        res.send({
            message: "User was deleted successfully!"
        });
    } else {
        res.send({
            message: `Cannot delete User with id=${id}. Maybe User was not found!`
        });
    }
});

// Delete all Users from the database.
exports.deleteAll = catchAsync(async (req, res) => {
    logger.warn('Attempting to delete all users.');
    const [nums] = await User.update({ active: false }, {
        where: {},
    });
    res.send({ message: `${nums} Users were deleted successfully!` });
    logger.info(`${nums} users were deleted successfully.`);
});

exports.deleteAllByDeptId = catchAsync(async (req, res) => {
    const departmentId = req.params.id;
    logger.warn(`Attempting to soft-delete all users for department ID: ${departmentId}`);

    const [nums] = await User.update({ active: false }, {
        where: { departmentId: departmentId },
    });
    logger.info(`${nums} users from department ${departmentId} were deleted successfully.`);
    res.send({ message: `${nums} Users from department ${departmentId} were deleted successfully!` });
});