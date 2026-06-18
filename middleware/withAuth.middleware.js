const jwt = require('jsonwebtoken');
const db = require("../models");
const User = db.user;

exports.verifyToken = (req, res, next) => {
    const bearerHeader = req.headers['authorization']; 
    
    if (!bearerHeader || !bearerHeader.startsWith('Bearer ')) {
        return res.status(401).send({ message: 'Access denied: No token provided' });
    }

    const token = bearerHeader.split(' ')[1];

    jwt.verify(token, process.env.SECRET_KEY, (err, authData) => {
        if (err) {
            return res.status(403).send({ message: 'Access denied: Invalid access token' });
        }
        req.authData = authData;
        next();
    });
};

exports.checkToken = (req, res) => {
    exports.verifyToken(req, res, () => {
        res.status(200).send({ message: 'Access granted!', authData: req.authData });
    });
};

exports.requireRoles = (...allowedRoles) => async (req, res, next) => {
    try {
        const authData = req.authData;
        if (!authData || !authData.user || !authData.user.id) {
            return res.status(401).send({ message: "Unauthorized" });
        }

        const user = await User.findOne({ where: { id: authData.user.id } });
        
        if (!user) {
            return res.status(403).send({ message: "Forbidden: User not found" });
        }

        if (!allowedRoles.includes(user.role)) {
            return res.status(403).send({ message: "Access denied: Role unauthorized for this endpoint" });
        }

        next();
    } catch (error) {
        res.status(500).send({ message: "Internal server error during authorization" });
    }
};

exports.withRoleAdmin = exports.requireRoles('ROLE_ADMIN');
exports.withRoleManager = exports.requireRoles('ROLE_MANAGER');
exports.withRoleAdminOrManager = exports.requireRoles('ROLE_ADMIN', 'ROLE_MANAGER');