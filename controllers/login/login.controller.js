const db = require("../../models");
const User = db.user;
const Department = db.department;
const Op = db.Sequelize.Op;
const bcrypt = require("bcrypt");
const { generateUrlToken } = require("../../utils/token.js");

// Login
exports.authenticate = async (req, res) => {
  // Validate request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
    return;
  }

  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .send({ message: "Username and password are required" });
    }
    const user = await User.findOne({ where: { username: req.body.username } });
    if (!user) {
      res.status(403).send({
        message: "Incorrect Credentials!",
      });
    }
    const passwordMatch = await bcrypt.compare(
      password,
      user.dataValues.password
    );
    if (!passwordMatch) {
      return res.status(403).send({ message: "Incorrect Credentials!" });
    }

    const userData = {
      id: user.dataValues.id,
      username: user.dataValues.username,
      fullname: user.dataValues.fullName,
      role: user.dataValues.role,
      organisationId: user.dataValues.organisationId,
    };
    const expiresIn = "1h";
    const secretKey = process.env.JWT_SECRET_KEY;
    const token = generateUrlToken({ user: userData }, secretKey, expiresIn);
    res.status(200).send({
      token: token,
      user: userData,
    });
  } catch (error) {
    res
      .status(500)
      .send({
        message: error.message || "Error occurred during authentication",
      });
  }
};
